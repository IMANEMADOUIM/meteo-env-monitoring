import { CookieOptions, Response } from "express";
import { calculateExpirationDate} from "./date";
import { BASE_PATH, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from "../constants/env";

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

// export const REFRESH_PATH = `${BASE_PATH}auth/refresh`;
const secure = process.env.NODE_ENV === "production";

const defaults:CookieOptions ={
  sameSite:process.env.NODE_ENV === "production" ? "none" : "lax",
  httpOnly: true,
  secure, 
};


export const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: calculateExpirationDate(JWT_EXPIRES_IN), // Appelle une fonction pour calculer l'expiration
      path: "/", // L'option 'path' est définie ici
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires : calculateExpirationDate(JWT_REFRESH_EXPIRES_IN),
    path: "/",
});

export const setAuthenticationCookies = ({ res, accessToken, refreshToken }: CookiePayloadType): Response => {

  return  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthenticationCookies = (res: Response): Response  =>
  res.clearCookie("accessToken",{...defaults,path: "/"}).clearCookie("refreshToken", {
    ...defaults,
    path: "/",
  });
