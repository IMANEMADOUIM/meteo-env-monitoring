import { Schema, model, Document } from "mongoose";

export enum TemperatureUnit {
  CELSIUS = "C",
  FAHRENHEIT = "F",
}

export interface ISettings extends Document {
  temperatureUnit: TemperatureUnit;
  notificationsEnabled: boolean;
  thresholds: {
    aqi: number;
    pm10: number;
    pm25: number;
    no2: number;
    o3: number;
    co: number;
  };
  userId: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    temperatureUnit: {
      type: String,
      enum: Object.values(TemperatureUnit),
      default: TemperatureUnit.CELSIUS,
    },
    notificationsEnabled: { type: Boolean, default: false },
    thresholds: {
      aqi: { type: Number, default: 120 },   // légèrement différent
      pm10: { type: Number, default: 40 },   // OMS ≠ ton ami
      pm25: { type: Number, default: 20 },
      no2: { type: Number, default: 180 },
      o3: { type: Number, default: 160 },
      co: { type: Number, default: 8 },
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default model<ISettings>("Settings", SettingsSchema);
