import { Request, Response } from "express";
import { getIO } from "../../config/webSocketConfig";
import notification from "../../models/notification";

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, type, message } = req.body;

    const notif = await notification.create({ userId, type, message });

    // ⚡ Émettre uniquement au userId (room)
    getIO().to(userId.toString()).emit("notification", notif);

    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de la notif" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // notif id
    const userId = req.user?.id;

    const notif = await notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    return res.json(notif);
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors du marquage comme lu" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    await notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors du marquage global" });
  }
};