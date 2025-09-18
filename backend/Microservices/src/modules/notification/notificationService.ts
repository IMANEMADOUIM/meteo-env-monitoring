import { Types } from "mongoose";
import NotificationModel, { INotification } from "../models/notificationModel";
import UserModel from "../models/userModel";

class NotificationService {
  async sendNotification(
    userId: Types.ObjectId,
    type: string,
    message: string,
    extra?: Partial<INotification>
  ): Promise<INotification | null> {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const notif = new NotificationModel({
      user: user._id,
      type,
      message,
      timestamp: new Date(),
      ...extra,
    });

    await notif.save();
    return notif;
  }

  async getUserNotifications(userId: Types.ObjectId) {
    return NotificationModel.find({ user: userId }).sort({ timestamp: -1 });
  }

  async markAsRead(userId: Types.ObjectId, notifIds: Types.ObjectId[]) {
    await NotificationModel.updateMany(
      { user: userId, _id: { $in: notifIds } },
      { $set: { isRead: true } }
    );
  }
}

export default new NotificationService();
