import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { OK } from "../../common/constants/http";
import { verifyMfaForLoginSchema, verifyMfaSchema } from "../../common/validators/mfaValidator";
import { MfaService } from "./mfaService ";

export class MfaController {
  private mfaService: MfaService;

  constructor(mfaService: MfaService) {
    this.mfaService = mfaService;
  }

  public generateMFASetup = asyncHandler(
    async (req: Request, res: Response) => {
      const { secret, qrImageUrl, message } =
        await this.mfaService.generateMFASetup(req);
      return res.status(OK).json({
        message,
        secret,
        qrImageUrl,
      });
    }
  );

  public verifyMFASetup = asyncHandler(async (req: Request, res: Response) => {
    const { code, secretKey } = verifyMfaSchema.parse({
      ...req.body,
    });
    const { userPreferences, message } = await this.mfaService.verifyMFASetup(
      req,
      code,
      secretKey
    );
    return res.status(OK).json({
      message: message,
      userPreferences: userPreferences,
    });
  });

  public revokeMFA = asyncHandler(async (req: Request, res: Response) => {
    const { message, userPreferences } = await this.mfaService.revokeMFA(req);
    return res.status(OK).json({
      message,
      userPreferences,
    });
  });

  public verifyMFAForLogin = asyncHandler(
    async (req: Request, res: Response) => {
      const { code, email, userAgent } = verifyMfaForLoginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
      });

      const { accessToken, refreshToken, user } =
        await this.mfaService.verifyMFAForLogin(code, email, userAgent);

      return setAuthenticationCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(OK)
        .json({
          message: "Verified & login successfully",
          user,
        });
    }
  );
}

function setAuthenticationCookies({
  res,
  accessToken,
  refreshToken,
}: {
  res: Response;
  accessToken: string;
  refreshToken: string;
}): Response {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res;
}