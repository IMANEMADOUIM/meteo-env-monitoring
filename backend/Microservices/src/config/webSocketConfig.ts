import { Server, Socket } from "socket.io";
import http from "http";
import { Express } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

let io: Server;

interface DecodedUser extends JwtPayload {
  id: string;
}

export function initWebSocket(app: Express, server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // ton frontend
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser;
      (socket as any).userId = decoded.id; // ✅ user attaché
      return next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`✅ User connecté via WS: ${userId}`);

    // rejoindre sa "room"
    socket.join(userId);

    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} déconnecté`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io pas encore initialisé !");
  }
  return io;
}
