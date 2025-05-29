import { Router } from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { authController } from "./authModule";

const authRoutes = Router();

authRoutes.post("/register", authController.registerHandler);
authRoutes.post("/login", authController.loginHandler);
authRoutes.post("/verify/email", authController.verifyEmailHandler);
authRoutes.post("/password/forgot", authController.forgotPasswordHandler);
authRoutes.post("/password/reset", authController.ResetPasswordHandler);
// Routes protégées avec vérification de rôle
authRoutes.post("/logout", authenticateJWT, authController.logoutHandler);

authRoutes.get("/refresh", authController.refreshTokenHandler);

export default authRoutes;