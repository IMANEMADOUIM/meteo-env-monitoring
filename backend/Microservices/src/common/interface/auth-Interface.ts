import { Document } from 'mongoose';
import Audience from "../constants/audience";
import { UserPreferences } from '../../models/userModel';




export interface RegisterDto {
  username : string;
  email : string;
  password: string;
  confirmPassword: string;
  role?: Audience;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  userAgent?: string;
}

export interface resetPasswordDto {
  password: string;
  confirmPassword: string;
  verificationCode: string;
}