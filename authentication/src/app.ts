import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { json } from 'body-parser';
import { APP_ORIGIN } from './constants/env';
import errorHandler from './middlewares/errorHandler';
import { NOT_FOUND, OK } from './constants/http';
import AppError from './utils/appError';
import errorController from './controllers/errorController';
import authRoutes from './routes/authRoute';


const app = express();

app.use(json({ limit: "10Kb" }));

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

// auth routes 
app.use("/api/auth", authRoutes);

app.get("/api/", async (req, res, next) => {
  try {
    throw new Error("This is a test error");
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export  default app;