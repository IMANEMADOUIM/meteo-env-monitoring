import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { APP_ORIGIN , BASE_PATH} from './common/constants/env';
import errorHandler from './middlewares/errorHandler';
import {  OK } from './common/constants/http';
import authRoutes from './modules/auth/authRoutes';
import { asyncHandler } from './middlewares/asyncHandler';
import passport from 'passport';
import mfaRoutes from './modules/mfa/mfaRoutes';
import { authenticateJWT } from './common/strategies/jwt.strategy';
import adminRoutes from './modules/admin/adminRoutes';


const app = express();
app.use(express.json({ limit: "10Kb" }));

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
  })
);
app.use(cookieParser());
app.use(passport.initialize());
// auth routes 

app.get( `${BASE_PATH}/`, asyncHandler(async (req, res, next) => {
    res.status(OK).json({status: 'healthy' 
    });
}));

app.use(`${BASE_PATH}/auth`, authRoutes);

app.use(`${BASE_PATH}/mfa`, mfaRoutes);

app.use(`${BASE_PATH}/admin`, authenticateJWT, adminRoutes);

app.set('trust proxy', true);

app.use(errorHandler);

export  default app;