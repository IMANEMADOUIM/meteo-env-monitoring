import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority?: "low" | "medium" | "high" | "critical";
  value?: number;
  unit?: string;
  location?: string;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  message: { type: String, required: true, maxlength: 1000 },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  value: Number,
  unit: String,
  location: String,
});

const NotificationModel = mongoose.model<INotification>("Notification", notificationSchema);
export default NotificationModel;
