import { Router } from "express";
import { getUserSettings, updateUserSettings } from "../settings/settingsController";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const router = Router();

router.get("/", authenticateJWT, getUserSettings);
router.put("/", authenticateJWT, updateUserSettings);

export default router;
