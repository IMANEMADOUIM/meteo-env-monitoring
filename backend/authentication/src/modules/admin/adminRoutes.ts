import { Router } from "express";
import { authorizeRoles } from "../../middlewares/authorize";
import { adminController } from "./adminModule";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const adminRoutes = Router();

// Middleware d'authentification et autorisation pour les routes admin
adminRoutes.use(authenticateJWT);
adminRoutes.use(authorizeRoles(["admin"]));

// Routes de gestion des utilisateurs
adminRoutes.get("/users", adminController.getAllUsers);
adminRoutes.get("/users/:id", adminController.getUserById);
adminRoutes.post("/users", adminController.createUser);
adminRoutes.put("/users/:id", adminController.updateUser);
adminRoutes.delete("/users/:id", adminController.deleteUser);

// Routes de gestion des sessions
adminRoutes.get("/sessions", adminController.getUsersWithSessionStatus);
adminRoutes.delete("/sessions/user/:userId", adminController.forceLogout);

// Dashboard admin
adminRoutes.get("/dashboard", adminController.getDashboardData);

export default adminRoutes;
