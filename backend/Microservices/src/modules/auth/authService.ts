import { APP_ORIGIN, JWT_REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_SECRET } from "../../common/constants/env";
import { CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, TOO_MANY_REQUESTS } from "../../common/constants/http";
import { ONE_DAY_MS, thirtyDaysFromNow,  fortyFiveMinutesFromNow, calculateExpirationDate, anHourFromNow, threeMinutesAgo } from "../../common/utils/date";
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from "../../common/utils/jwt";
import AppError from "../../common/utils/appError";
import UserModel, { UserDocument } from "../../models/userModel";
import SessionModel, { SessionDocument } from "../../models/sessionModel";
import { BadRequestException, HttpException, InternalServerException, NotFoundException, UnauthorizedException } from "../../exceptions/exceptions";
import AppErrorCode from "../../common/constants/appErrorCode";
import { LoginDto, RegisterDto, resetPasswordDto } from "../../common/interface/auth-Interface";
import Audience from "../../common/constants/audience";
import VerificationCodeModel from "../../models/verificationModel";
import VerificationCodeType from "../../common/constants/verificationCodeType";
import { sendEmail } from "../../mailers/mailer";
import { passwordResetTemplate, verifyEmailTemplate } from "../../mailers/templates/templates";
import { logger } from "../../common/utils/logger";
import { hashValue } from "../../common/utils/bcypt";
import { lookup } from "ip-location-api";

/**
 * Crée un nouveau compte utilisateur
 */
export class AuthService {
  public async createAccount (registerData: RegisterDto) {
  const { email, password, username, role = Audience.User, userAgent, ipAddress } = registerData;

  let location: string | undefined;
  if (ipAddress) {
    try {
      const geo = await lookup(ipAddress);
      if (geo && geo.city && geo.country_name) {
        location = `${geo.city}, ${geo.country_name}`;
      } else if (geo && geo.country_name) {
        location = geo.country_name;
      }
    } catch (error) {
      logger.error(`Failed to get location for IP ${ipAddress}: ${error}`);
    }
  }

  // Vérifie si le rôle est valide
  if (!Object.values(Audience).includes(role)) {
     throw new BadRequestException("Invalid role provided", AppErrorCode.AUTH_INVALID_ROLE);
    } 

  // Vérifie si l'utilisateur existe déjà
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestException("User already exists with this email", AppErrorCode. AUTH_EMAIL_ALREADY_EXISTS);
  }

  // Crée l'utilisateur dans MongoDB
  const user = await UserModel.create({
    username,
    email,
    password, // Sera haché par le middleware du modèle
    role,
    location,
  });

  const userId = user._id;

  // Crée une session
  const session = await SessionModel.create({
    userId,
    userAgent,
  });

    // Crée  une vérification 
    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiredAt: fortyFiveMinutesFromNow(),
    });
    
     // Sending verification email link
     const verificationUrl = `${APP_ORIGIN}/confirm-account?code=${verification.code}`;
     await sendEmail({
       to: user.email,
       ...verifyEmailTemplate(verificationUrl),
     });

  // Génère les tokens
  const refreshToken = signToken(
    { sessionId: session._id },
    { ...refreshTokenSignOptions, expiresIn: '30d' }
  );

  const accessToken = signToken({
    userId,
    sessionId: session._id,
    role: user.role,
  }, {
    secret: JWT_SECRET,
    expiresIn: '15m'
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

/**
 * Connecte un utilisateur 
 */
  public async loginUser  (loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

  // Récupère l'utilisateur dans MongoDB
  logger.info(`Login attempt for email: ${email}`);
  const user = await UserModel.findOne({ email  });
  if (!user) {
    logger.warn(`Login failed: User with email ${email} not found`);
    throw new BadRequestException( "Utilisateur non trouvé", AppErrorCode.AUTH_USER_NOT_FOUND);
  }

  // Vérifie le mot de passe
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    logger.warn(`Login failed: Invalid password for email: ${email}`);
    throw new BadRequestException(
      "Invalid email or password provided",
      AppErrorCode.AUTH_USER_NOT_FOUND
    );
  }

   // Vérifie si l'email est confirmé
   if (!user. isEmailVerified) {
    logger.warn(`Login blocked: Email not verified for user ID: ${user._id}`);
    throw new BadRequestException( 
      "Veuillez vérifier votre email avant de vous connecter",
       AppErrorCode.ACCESS_FORBIDEN
      );
  }

  if (!user.isActive) {
    throw new Error("Account disabled. Please contact support.");
  }

  if (user.isLocked) {
    throw new Error("Account locked. Please try again later or contact support.");
  }

  if (user.credentialsExpired) {
    throw new Error("Credentials expired. Please reset your password.");
  }

    // Check if the user enable 2fa retuen user= null
  if (user.userPreferences?.enable2FA) {
    logger.info(`2FA required for user ID: ${user._id}`);
    return {
      user: null,
      mfaRequired: true,
      accessToken: "",
      refreshToken: "",
      message: "2FA required"
     };
   }

  // Crée une session
  logger.info(`Creating session for user ID: ${user._id}`);
  const session = await SessionModel.create({
    userId: user._id,
    userAgent,
    createdAt: new Date()
  });

  // Génère les tokens
  logger.info(`Signing tokens for user ID: ${user._id}`);

  const accessToken = signToken({
    userId: user._id,
    sessionId: session._id,
    role: user.role,
  }, {
    secret: JWT_SECRET,
    expiresIn: '15m'
  });

  const refreshToken = signToken(
    { sessionId: session._id },
    { 
      ...refreshTokenSignOptions,
      secret : JWT_REFRESH_SECRET, 
      expiresIn: '30d' 
      }
  );

  logger.info(`Login successful for user ID: ${user._id}`);
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
    mfaRequired: false,
 
  };
}
/** 
 * Rafraîchit le token d'accès (complétion de la fonction)
 */
public async refreshToken(refreshToken: string) {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  if (!payload) {
    throw new UnauthorizedException("Token de rafraîchissement invalide");
  }

  const session = await SessionModel.findById(payload.sessionId);
  const now = Date.now();

  if (!session) {
    throw new UnauthorizedException("Session does not exist");
  }

  if (session.expiredAt.getTime() <= now) {
    throw new UnauthorizedException("Session expirée");
  }

   // Récupérer l'utilisateur complet pour obtenir son rôle actuel
const user = await UserModel.findById(session.userId);
if (!user) {
  throw new UnauthorizedException("User does not exist");
}  

  const sessionRequireRefresh =
  session.expiredAt.getTime() - now <= ONE_DAY_MS;

if (sessionRequireRefresh) {
  session.expiredAt = calculateExpirationDate(
    JWT_REFRESH_EXPIRES_IN
  );
  await session.save();
}

  // Prolonger la durée de vie de la session si elle expire bientôt
  const expiresIn30Days = thirtyDaysFromNow().getTime();
  if (session.expiredAt.getTime() - now < 7 * ONE_DAY_MS) {
    session.expiredAt = new Date(expiresIn30Days);
    await session.save();
  }
 
const newRefreshToken = sessionRequireRefresh
? signToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions
  )
: undefined;

 // Générer un nouveau token d'accès
const accessToken = signToken({
  userId: user._id,
  sessionId: session._id,
  role: user.role,
}, 
{
   secret: JWT_SECRET,
   expiresIn: '15m'
 });

return {
accessToken,
newRefreshToken,
}
};

/**
 * Déconnexion utilisateur
 */
public async logoutUser (sessionId: string) {
  const session = await SessionModel.findByIdAndDelete(sessionId);
  if (!session) {
    throw new AppError(NOT_FOUND, "Session non trouvée");
  }


  return { success: true };
};

/**
 * Déconnexion de toutes les sessions d'un utilisateur
 */
public async  logoutFromAllDevices (userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(NOT_FOUND, "Utilisateur non trouvé");
  }

  // Supprimer toutes les sessions
  await SessionModel.deleteMany({ userId });
  return { success: true };
};

/**
 *  Confirmer La vérification d'email via le lien envoyé
 */
public async verifyEmail(code: string) {
  const trimmedCode = code.trim();
  // Rechercher un code de vérification valide
  const validCode = await VerificationCodeModel.findOneAndDelete({
    code:  trimmedCode,
    type: VerificationCodeType.EMAIL_VERIFICATION,
    expiredAt: { $gt: new Date() },
  });

  if (!validCode) {
    throw new BadRequestException("Invalid or expired verification code", 
      AppErrorCode.VALIDATION_ERROR
    );
  }

  // Vérifier que l'utilisateur existe encore
  const user = await UserModel.findById(validCode.userId);
  if (!user) {
    throw new BadRequestException(
      "Utilisateur non trouvé",
      AppErrorCode.AUTH_USER_NOT_FOUND
    );
  }

// Vérifier si l'email n'est pas déjà vérifié
  if (user.isEmailVerified) {
    return {
      success: true,
      message: "Votre email est déjà vérifié",
      user: user.omitPassword(), // Correction du bug
    };
  }

  // Mettre à jour l'utilisateur associé au code
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      isEmailVerified: true,
      "userPreferences.verificationStatus" : "verified",
      emailVerifiedAt: new Date(), // Mettre à jour le statut de vérification
    },
    { new: true }
  );
  return {
    success: true,
    message: "Votre email a été vérifié avec succès",
    user: user.omitPassword(),// Retourner l'utilisateur vérifié
   
  };
};

/**
 * Réinitialisation du mot de passe (admin ou utilisateur authentifié)
 */
public async forgotPassword(email: string) {
  const user = await UserModel.findOne({
    email: email,
  });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  //check mail rate limit is 2 emails per 3 or 10 min
  const timeAgo = threeMinutesAgo();
  const maxAttempts = 2;

  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PASSWORD_RESET,
    createdAt: { $gt: timeAgo },
  });

  if (count >= maxAttempts) {
    throw new HttpException(
      "Too many request, try again later",
      TOO_MANY_REQUESTS,
      AppErrorCode.AUTH_TOO_MANY_ATTEMPTS
    );
  }

  const expiredAt = anHourFromNow();
  const validCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PASSWORD_RESET,
    expiredAt,
  });

  const resetLink = `${APP_ORIGIN}/reset-password?code=${
    validCode.code
  }&exp=${expiredAt.getTime()}`;

  const { data, error } = await sendEmail({
    to: user.email,
    ...passwordResetTemplate(resetLink),
  });

  if (!data?.id) {
    throw new InternalServerException(`${error?.name} ${error?.message}`);
  }

  return {
    url: resetLink,
    emailId: data.id,
  };
}

public async resetPassword({ password, verificationCode }: resetPasswordDto) {
  const validCode = await VerificationCodeModel.findOne({
    code: verificationCode,
    type: VerificationCodeType.PASSWORD_RESET,
    expiredAt: { $gt: new Date() },
  });

  if (!validCode) {
    throw new NotFoundException("Invalid or expired verification code");
  }

  const hashedPassword = await hashValue(password);

  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
    password: hashedPassword,
  });

  if (!updatedUser) {
    throw new BadRequestException("Failed to reset password!");
  }

  await validCode.deleteOne();

  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });

  return {
    user: updatedUser,
  };
}

/**
 * Récupère le profil d'un utilisateur par son ID
 */
public async getUserProfile(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user.omitPassword();
}

/**
 * Met à jour le profil d'un utilisateur
 */
public async updateUserProfile(userId: string, updateData: any) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (updateData.username) {
    user.username = updateData.username;
  }

  if (updateData.email) {
    // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    const existingUserWithEmail = await UserModel.findOne({ email: updateData.email });
    if (existingUserWithEmail && existingUserWithEmail.id.toString() !== userId) {
      throw new BadRequestException("Email already in use");
    }
    user.email = updateData.email;
    user.isEmailVerified = false; // L'email doit être re-vérifié
    user.emailVerifiedAt = undefined;
    // TODO: Envoyer un nouvel email de vérification
  }

  if (updateData.password && updateData.oldPassword) {
    const isPasswordValid = await user.comparePassword(updateData.oldPassword);
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid old password");
    }
    user.password = updateData.password; // Le middleware du modèle hachera le nouveau mot de passe
  }

  await user.save();
  return user.omitPassword();
}

/**
 * Supprime le compte d'un utilisateur
 */
public async deleteUserAccount(userId: string) {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  // Supprimer toutes les sessions et codes de vérification associés à l'utilisateur
  await SessionModel.deleteMany({ userId });
  await VerificationCodeModel.deleteMany({ userId });

  return { success: true };
}

}