import mongoose from "mongoose";
import { calculateExpirationDate} from "../common/utils/date";


export interface SessionDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isValid: boolean;
  expiredAt: Date;
  userAgent?: string;
  ipAddress: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive(): boolean;
  refreshExpiration(days?: number): void;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    validate: {
      validator: (v: mongoose.Types.ObjectId) => mongoose.isValidObjectId(v),
      message: props => `${props.value} n'est pas un ObjectId valide!`
    }
  },
  userAgent: { type: String, required: false },
  ipAddress: { 
    type: String,
     required: false, 
     default: "127.0.0.1" ,
     validate: {
      validator: (v: string) => {
        // Accepte IPv4 et IPv6
        return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v) || 
               /^(::1|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})$/.test(v);
      },
      message: props => `${props.value} n'est pas une adresse IP valide!`
    }
     },
  isValid: { type: Boolean, default: true },
  createdAt: { type: Date, required: true, default: Date.now },
  expiredAt: { type: Date, required: true,  default: () => calculateExpirationDate("30d") },
  lastActivity: { type: Date, default: Date.now },
},
{
  collection: "sessions",
  timestamps: true 
}
);

// Create index for faster queries

sessionSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ lastActivity: 1 });
sessionSchema.index({ userId: 1, isValid: 1 });

// Méthode pour vérifier si une session est active et valide
sessionSchema.methods.isActive = function (): boolean {
  return this.isValid && new Date() < this.expiredAt;
};

sessionSchema.methods.refreshExpiration = function(days: number = 30): void {
  this.expiredAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.lastActivity = new Date();
};

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);
export default SessionModel;