import dotenv from 'dotenv';
import  mongoose from "mongoose";
import { MONGO_URI } from "../common/constants/env";

dotenv.config();

const connectDB = async () =>{
  try{
    await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");0
}catch (err){
  console.error("Database connection error:", err);
  console.log("Some error occured while connecting to database");
  process.exit(1);
}
 };
 export default connectDB;