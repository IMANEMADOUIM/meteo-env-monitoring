import mongoose, { Schema, Document } from 'mongoose';

export interface IMeteo extends Document {
  userId: string;
  temperature: number;
  temperatureRessentie: number;
  humidite: number;
  pression: number;
  description: string;
  icone: string;
  vitesseVent: number;
  directionVent?: number;
  ville: string;
  pays: string;
  dateCreation: Date;
  typeMeteo: 'ACTUELLE' | 'PREVISION';
  datePrevision?: Date;
}

const MeteoSchema = new Schema<IMeteo>({
  userId: { type: String, required: true },
  temperature: Number,
  temperatureRessentie: Number,
  humidite: Number,
  pression: Number,
  description: String,
  icone: String,
  vitesseVent: Number,
  directionVent: Number,
  ville: String,
  pays: String,
  dateCreation: { type: Date, default: Date.now },
  typeMeteo: { type: String, enum: ['ACTUELLE', 'PREVISION'], required: true },
  datePrevision: Date,
});

export const Meteo = mongoose.model<IMeteo>('Meteo', MeteoSchema);
