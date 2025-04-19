import dotenv from "dotenv";

dotenv.config();
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants/env";

// Signer un token
const accessToken = jwt.sign({ userId: "123" }, JWT_SECRET, {
  expiresIn: "15m",
});

// Vérifier un token
try {
  const decoded = jwt.verify(accessToken,JWT_SECRET);
  console.log("Décodé :", decoded);
} catch (err) {
  console.error("Token invalide :", err.message);
}
