import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { json } from 'body-parser';
import { APP_ORIGIN } from './constants/env';
import errorHandler from './middlewares/errorHandler';
import { NOT_FOUND, OK } from './constants/http';
import AppError from './utils/appError';
import errorController from './controllers/errorController';
import globalErrorHandler from './middlewares/globalErrorHandler';
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
app.use(errorHandler);

app.get("/", (req, res, next) => {
  try {
    res.status(OK).json({ status: "healthy" });
  } catch (error) {
    next(error); // Passe l'erreur au middleware d'erreur
  }
});


// auth routes 
app.use("/api/auth", authRoutes);

app.use(globalErrorHandler);

export  default app;