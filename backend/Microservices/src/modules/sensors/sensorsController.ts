import { Request, Response } from "express";
import AtmosRecord from "../../models/AtmosRecord";


/**
 * GET /api/records/latest
 */
export async function getLatest(_req: Request, res: Response) {
  try {
    const latest = await AtmosRecord.findOne().sort({ collectedAt: -1 }).lean().exec();
    if (!latest) return res.status(404).json({ message: "No readings yet" });
    return res.json(latest);
  } catch (err) {
    console.error("getLatest err", err);
    return res.status(500).json({ error: "server_error" });
  }
}

/**
 * GET /api/records/history?limit=24
 */
export async function getHistory(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 24), 1000);
    const rows = await AtmosRecord.find().sort({ collectedAt: -1 }).limit(limit).lean().exec();
    return res.json(rows);
  } catch (err) {
    console.error("getHistory err", err);
    return res.status(500).json({ error: "server_error" });
  }
}
