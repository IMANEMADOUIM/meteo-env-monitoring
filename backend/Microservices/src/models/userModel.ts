import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import { compareValue, hashValue } from "../common/utils/bcypt";
import Audience from "../common/constants/audience";


export interface UserPreferences {
  enable2FA?: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
  verificationStatus: string;
}

// Interface pour typer un document utilisateur
 export interface UserDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId ;
  id?: never;
  username: string;
  email: string;
  password: string;
  role : Audience ;
  isEmailVerified: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  credentialsExpired?: boolean;
  userPreferences?: UserPreferences;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  comparePassword(val:string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password" | "__v">;


  
}

const userPreferencesSchema = new Schema<UserPreferences>({
  enable2FA: { type: Boolean, default: false },
  emailNotification: { type: Boolean, default: true },
  twoFactorSecret: { type: String, required: false },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' }, // Ajout du statut de vérification
});

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: {
      type: String,
      required: [true, "Please provide username"],
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
      match: /^[a-zA-Z0-9_]+$/,   
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6,"Password must have at least 6 characters."],
      maxlength: [32, "Password cannot have more than 32 characters."],
      select: true,
    },

    role: {
        type: String,
        enum: Object.values(Audience),
        default: Audience.User,
    },

    userPreferences: {
      type: userPreferencesSchema,
      default: {
        enable2FA: false,
        emailNotification: true,
        verificationStatus: "pending",
      },
    },
    
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    credentialsExpired: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true, // Pour ajouter automatiquement `createdAt` et `updatedAt`
    toJSON : {},
  }
);

userSchema.pre("save", async function( next) {
  
  if (!this.isModified("password")|| !this.password){
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string){
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function (){
  const user = this.toObject();
  delete user.password;
  delete user.userPreferences?.twoFactorSecret; // Exclure également twoFactorSecret
  delete user.role;
  return user;
};



const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
