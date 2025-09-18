import { Router } from "express";
import { getHistory, getLatest } from "./sensorsController";


const router = Router();

router.get("/latest", getLatest);
router.get("/history", getHistory);

export default router;
