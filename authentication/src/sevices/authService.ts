import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/sessionModel";
import UserModel from "../models/userModel";
import VerificationCodeModel from "../models/verificationCode.model";
import AppError from "../utils/appError";
import { oneYearFromNow } from "../utils/date";
import jwt from "jsonwebtoken"; 

export type CreateAccountParams = {
  username: string;
  email: string;
  password: string;
  userAgent?: string;
}
export const createAccount = async (data: CreateAccountParams) => {
  // verify existing user doesnt exist
  const  existingUser = await UserModel.exists({
    email: data.email,
  });
  if (existingUser){
    throw new AppError("User already exists", 400);
  }

  //create user
  const user = await UserModel.create({
    username: data.username,
    email: data.email,
    password: data.password,
  });

  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow()
  });
  //send verification email

  //create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });

  //sign access token & refresh token
  const refreshToken = jwt.sign(
   { sessionId: session._id },
   JWT_REFRESH_SECRET,
   {
    audience:["user"],
    expiresIn: "30d",
   }
  );

  const accessToken = jwt.sign(
    { 
      userId: user._id,
      sessionId: session._id },
    JWT_SECRET,
    {
     audience:["user"],
     expiresIn: "15m",
    }
   );

  // return user & tokens
  return{
    user,
    accessToken,
    refreshToken,
  };
};