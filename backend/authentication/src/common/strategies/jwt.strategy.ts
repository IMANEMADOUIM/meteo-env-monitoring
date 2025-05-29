import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";

import passport, { PassportStatic } from "passport";
import { UnauthorizedException } from "../../exceptions/exceptions";
import AppErrorCode from "../constants/appErrorCode";
import { userService } from "../../modules/user/userModule";
import { JWT_SECRET } from "../constants/env";



interface JwtPayload {
  userId: string;
  sessionId: string;
  role?: string;

}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) =>  {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        throw new UnauthorizedException(
          "Unauthorized access token",
          AppErrorCode.AUTH_TOKEN_NOT_FOUND
        );
      }
      return accessToken;
    },
    (req) => req.cookies.accessToken || req.headers.authorization?.split(" ")[1],
  ]),
  secretOrKey: JWT_SECRET,
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use('jwt',
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        console.log('JWT Strategy - Payload:', payload);
        const user = await userService.findUserById(payload.userId);
        console.log('JWT Strategy - User found:', !!user, user?.email);

        if (!user) {
          console.log('JWT Strategy - User not found for ID:', payload.userId);
          return done(null, false, { message: 'Utilisateur non trouvé' });
        }

        // Ajouter sessionId directement à req
        req.sessionId = payload.sessionId;
        
        return done(null, user);
      } catch (error) {
        console.log('JWT Strategy - Error:', error);
        return done(error, false);
      }
    })
  );
};


// AUTO-INITIALISATION : La stratégie se configure automatiquement
setupJwtStrategy(passport);

export const authenticateJWT = passport.authenticate("jwt", { session: false });
export default passport;