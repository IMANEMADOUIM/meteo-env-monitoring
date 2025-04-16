import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import { compareValue, hashValue } from "../utils/bcypt";

// Interface pour typer un document utilisateur
 export interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updateAt: Date;
  isVerified: boolean;
  comparePassword(val:string): Promise<boolean>;
  otp?: string;
  otpExpire?: Date;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;

}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: {
      type: String,
      required: [true, "Please provide username"],
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      minlength: 1,
      maxlength: 255,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      maxlength: 255,
      select: false,
    },
   

    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true, // Pour ajouter automatiquement `createdAt` et `updatedAt`
  }
);

userSchema.pre("save", async function( next) {
  // Vérification des champs requis
  if (!this.username || !this.email || !this.password || !this.isVerified) {
    return next(new Error("All fields are required"));
  }
  
  if (!this.isModified("password")){
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string){
  return compareValue(val, this.password);
}
const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
