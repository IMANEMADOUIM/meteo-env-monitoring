import dotenv from 'dotenv';
import  mongoose from "mongoose";
import { userInfo } from "os";
import { MONGO_URI } from "../constants/env";

dotenv.config();

const connectDB = async () =>{
  try{
    await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
}catch (err){
  console.error("Database connection error:", err);
  process.exit(1);
}
 };
 export default connectDB;