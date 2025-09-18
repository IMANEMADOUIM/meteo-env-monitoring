import express from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { createNotification,  markAllAsRead, markAsRead } from "./notificationController";
import { authorizeRoles } from "../../middlewares/authorize";


const router = express.Router();

router.post("/", authenticateJWT,authorizeRoles(["admin"]), createNotification);
router.patch("/:id/read", authenticateJWT, markAsRead);
router.patch("/read-all", authenticateJWT, markAllAsRead);

export default router;
