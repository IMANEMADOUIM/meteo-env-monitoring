import { Schema, model, Document } from "mongoose";

export interface IAtmosRecord extends Document {
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  aqi: number;
  collectedAt: Date;
}

const atmosSchema = new Schema<IAtmosRecord>({
  pm2_5: { type: Number, required: true },
  pm10: { type: Number, required: true },
  no2: { type: Number, required: true },
  o3: { type: Number, required: true },
  co: { type: Number, required: true },
  aqi: { type: Number, required: true },
  collectedAt: { type: Date, default: () => new Date() }
});

export default model<IAtmosRecord>("AtmosRecord", atmosSchema);
