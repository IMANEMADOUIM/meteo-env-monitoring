import { Request, Response } from "express";
import * as settingsService from "../settings/settingsService";

export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // supposons que JWT middleware injecte user
    const settings = await settingsService.getSettingsByUser(userId);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const settings = await settingsService.updateSettings(userId, req.body);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};
