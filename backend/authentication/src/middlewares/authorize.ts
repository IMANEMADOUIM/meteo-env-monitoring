import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/exceptions";
import AppErrorCode from "../common/constants/appErrorCode";


export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any; // `req.user` est défini par Passport.js après authentification
    if (!req.user || !roles.includes(req.user.role)) {
      throw new UnauthorizedException(
        "Unauthorized role",
        AppErrorCode.AUTH_FORBIDDEN
      );
    }
    next();
  };
};
