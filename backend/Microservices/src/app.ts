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
import meteoRoutes from './modules/meteo/meteoRoutes';
import sensorsRoutes from './modules/sensors/sensorsRoutes';
import http from "http";
import { initWebSocket } from "./config/webSocketConfig";
import notificationRoutes from './modules/notification/notificationRoutes';
import settingsRoutes from './modules/settings/settingsRoutes';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
// ⚡ Initialiser WebSocket
initWebSocket(app, server);

app.use(express.json({ limit: "10Kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token' ],
    exposedHeaders: ['Set-Cookie']
  })
);
app.use(cookieParser());
app.use(passport.initialize());

// Healthcheck
app.get( `${BASE_PATH}/`, asyncHandler(async (req, res, next) => {
    res.status(OK).json({status: 'healthy' 
    });
}));

/* =========================
   Rate limiting
   ========================= */
// Plus strict pour /auth/*
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 50,                   // 50 req/15min par IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`${BASE_PATH}/auth`, authLimiter);

// Limiter “light” global (facultatif)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`${BASE_PATH}`, apiLimiter);

/* =========================
   (Optionnel) CSRF via cookie
   ========================= */
// À activer si tu gardes tes JWT en cookies (c’est ton cas)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  },
});

// Expose un endpoint pour récupérer le token CSRF (à appeler depuis le front)
app.get(`${BASE_PATH}/csrf-token`, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/mfa`, mfaRoutes);

app.use(`${BASE_PATH}/admin`, authenticateJWT, adminRoutes);
app.use(`${BASE_PATH}/meteo`, authenticateJWT, meteoRoutes);
app.use(`${BASE_PATH}/sensors`, authenticateJWT, sensorsRoutes);
app.use(`${BASE_PATH}/settings`, authenticateJWT, settingsRoutes);
app.use(`${BASE_PATH}/notifications`, authenticateJWT, notificationRoutes);

app.get("/", (_req, res) => res.json({ service: "env-poller", status: "ok" }));
app.set('trust proxy', true);

app.use(errorHandler);

export  default app;