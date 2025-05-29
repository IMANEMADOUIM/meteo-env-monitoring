import { asyncHandler } from "../../middlewares/asyncHandler";
import catchErrors from "../../common/utils/catchErrors";
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "../../common/constants/http";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verificationEmailSchema } from "../../common/validators/authValidator";
import {  clearAuthenticationCookies, getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthenticationCookies } from "../../common/utils/cookies";
import appAssert from "../../common/utils/appAssert";
import Audience from "../../common/constants/audience";
import { authService } from "./authModule";
import { AuthService } from "./authService";
import { createUserSession } from "../../common/utils/session";



export class AuthController {
  private AuthService: AuthService;

  constructor(AuthService: AuthService) {
    this.AuthService = AuthService;
  }
/**
 * Création de compte utilisateur
 */
public  registerHandler = asyncHandler(async (req, res): Promise<any> => {
  // Validate request
  const body = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
    role: req.body.role as Audience || "user",
  });

 // Call the register method from AuthService
 const { user } = await authService.createAccount(body);

 // Send response
 return res.status(CREATED).json({
   message: "User registered successfully",
   data: user,
 });
});
/**
 * Authentification email/mot de passe classique
 */
public  loginHandler = asyncHandler(async (req , res): Promise<any>  => {
  const userAgent = req.headers["user-agent"];
  
  // Récupérer l'IP du client
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  const body = loginSchema.parse({
    ...req.body,
    userAgent,
  });


  const { user, accessToken, refreshToken, mfaRequired } = 
   await authService.loginUser(body);

  if (mfaRequired) {
      return res.status(OK).json({
      message: "Verify MFA authentication",
      mfaRequired,
      user,
    });
  }

      // Vérification que user n'est pas null
  if (!user) {  
    return res.status(UNAUTHORIZED).json({
    message: "Authentication failed",
      });
  }  
    // Créer une session en base de données après authentification réussie
    const session = await createUserSession(
        user._id.toString(),
        ipAddress,
        userAgent,
  );

  return setAuthenticationCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({
      message: "User Login successful",
      mfaRequired,
      user,
    });
});

/**
 * Rafraîchissement du token d'accès
 */
public refreshTokenHandler = asyncHandler(async (req, res): Promise<any> => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } = 
  await authService.refreshToken(refreshToken);

  // Mettre à jour le refreshToken uniquement s'il a été renouvelé
  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({
      message: "Refresh access token successsfully",
    });
});

/**
 * Déconnexion utilisateur
 */
 public  logoutHandler = asyncHandler(async (req, res): Promise<any> => {
  // Le middleware authenticateJWT a déjà vérifié le token et ajouté sessionId à req
  const sessionId = req.sessionId;
  
  if (!sessionId) {
    return res.status(UNAUTHORIZED).json({
      message: "Session is invalid",
    });
  }

      // Déconnexion au niveau du service d'authentification
    await authService.logoutUser(sessionId);
    
  // Supprimer les cookies d'authentification et retourner une réponse
    return clearAuthenticationCookies(res).status(OK).json({
      message: "User logout successfully",
    });
  });

/**
 * Vérification d'email
 */
public  verifyEmailHandler = asyncHandler(async (req, res) : Promise<any> => {
  const { code } = verificationEmailSchema.parse(req.body);
  
  // Validation supplémentaire du code
   if (!code|| code.trim().length === 0) {
     return res.status(BAD_REQUEST).json({
      success: false,
       message: "Verification code is required",
     });
   }

   const result = await authService.verifyEmail(code);

  return res.status(OK).json({
    success: result.success,
    message: "Email verified successfully",
    data: {
      user: result.user,
      
    }
  });
});
  /**
 * forget  password
 */
public forgotPasswordHandler = asyncHandler(async (req, res): Promise<any> => {
  const {email}= forgotPasswordSchema.parse(req.body);
  
  // Appeler le service pour envoyer un email de réinitialisation
  await authService.forgotPassword(email);

  // Retourner une réponse de succès
  return res.status(OK).json({
    message: "Password reset email sent",
  });
}
);

  /**
 * reset password
 */ 
public  ResetPasswordHandler = asyncHandler(async (req, res): Promise<any> => {
  const body = resetPasswordSchema.parse(req.body);
  
  // Appeler le service pour envoyer un email de réinitialisation
 await authService.resePassword(body);

    // Supprimer les cookies d'authentification et retourner une réponse
  return clearAuthenticationCookies(res).status(OK).json({
    message: "Reset Password successfully",
  });
});
/**
 * Obtenir le profil utilisateur
 */
public  getProfileHandler = asyncHandler(async (req, res): Promise<any> => {
  const userId = req.userId; // Assuming this is set by auth middleware
  
  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  // const user = await authService.getUserProfile(userId);

  // return res.status(OK).json({
  //   message: "Profile retrieved successfully",
  //   data: user,
  // });
});
}