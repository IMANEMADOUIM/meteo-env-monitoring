import { Request } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../exceptions/exceptions";
import UserModel, { UserDocument } from "../../models/userModel";
import SessionModel from "../../models/sessionModel";
import { refreshTokenSignOptions, signToken } from "../../common/utils/jwt";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../common/constants/env";

export class MfaService {
  public async generateMFASetup(req: Request) {
    const user = req.user as UserDocument;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (!user.userPreferences) {
      user.userPreferences = {
        emailNotification: true,
        enable2FA: false,
        verificationStatus: 'pending'
      };
    }

    if (user.userPreferences?.enable2FA) {
      return {
        message: "MFA already enabled",
      };
    }

    const secret = speakeasy.generateSecret({ 
      name: "Squeezy", 
      length: 32 
    });

    const secretKey = secret.base32;

      user.userPreferences.twoFactorSecret = secretKey;
      await user.save();
  
    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: `Squeezy:${user.email || user.username}`,
      issuer: "squeezy",
      encoding: "base32",
    });

    const qrImageUrl = await qrcode.toDataURL(url);

    return {
      message: "Scan the QR code or use the setup key.",
      secret: secretKey,
      qrImageUrl,
    };
  }

  public async verifyMFASetup(req: Request, code: string, secretKey: string) {
    const user = req.user as UserDocument;
  
    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }
  
    if (user.userPreferences?.enable2FA) {
      return {
        message: "MFA is already enabled",
        userPreferences: {
          enable2FA: user.userPreferences.enable2FA,
        },
      };
    }
  
    const storedSecretKey = user.userPreferences?.twoFactorSecret;
    
    if (!storedSecretKey) {
      throw new BadRequestException("MFA setup not found. Please generate QR code first.");
    }

    const isValid = speakeasy.totp.verify({
      secret: storedSecretKey, 
      encoding: "base32",
      token: code.trim(),
      window: 6,
      time: Math.floor(Date.now() / 1000)
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again.");
    }
  
    if (!user.userPreferences) {
      user.userPreferences = {
        emailNotification: true,
        enable2FA: false,
        verificationStatus: 'pending'
      };
    }
  
    user.userPreferences.enable2FA = true;
    await user.save();

    return {
      message: "MFA setup completed successfully",
      userPreferences: {
        enable2FA: user.userPreferences.enable2FA,
      },
    };
  }

  public async revokeMFA(req: Request) {
    const user = req.user as UserDocument;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (!user.userPreferences?.enable2FA) {
      return {
        message: "MFA is not enabled",
        userPreferences: {
          enable2FA: user.userPreferences?.enable2FA,
        },
      };
    }

    user.userPreferences.twoFactorSecret = undefined;
    user.userPreferences.enable2FA = false;
    await user.save();

    return {
      message: "MFA revoke successfully",
      userPreferences: {
        enable2FA: user.userPreferences.enable2FA,
      },
    };
  }

  public async verifyMFAForLogin(
    code: string,
    email: string,
    userAgent?: string
  ) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (
      !user.userPreferences?.enable2FA &&
      !user.userPreferences?.twoFactorSecret
    ) {
      throw new UnauthorizedException("MFA not enabled for this user");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.userPreferences.twoFactorSecret!,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again.");
    }

    //sign access token & refresh token
    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = signToken({
      userId: user._id,
      sessionId: session._id,
    });

    const refreshToken = signToken(
      {
        sessionId: session._id,
      },
      refreshTokenSignOptions
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}


