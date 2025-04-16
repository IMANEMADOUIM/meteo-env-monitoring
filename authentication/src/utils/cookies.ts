import { CookieOptions, Response } from "express";
import { fifteenMiutesFromNow, thirtyDaysFromNow } from "./date";

const secure = process.env.Node_ENV !== "developpement";

const defaults:CookieOptions ={
  sameSite:"strict",
  httpOnly: true,
  secure
};

const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: fifteenMiutesFromNow(),
});

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: "auth/refresh",
});
type Params ={
  res: Response;
  accessToken: string;
  refreshToken: string;
};
export const setAuthCookies = ({ res, accessToken, refreshToken}: Params ) =>
  res
.cookie("accessToken", accessToken, getAccessTokenCookieOptions())
.cookie("refreshToken",refreshToken, getRefreshTokenCookieOptions());
