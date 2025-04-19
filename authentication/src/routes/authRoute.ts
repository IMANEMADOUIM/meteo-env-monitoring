import { Router } from "express";;
import { loginHandler, registerHandler } from "../controllers/authController";
import { CREATED } from "../constants/http";

const authRoutes = Router();

// prefix: /auth
authRoutes.post("/register", registerHandler,(req,res) => {
  res.status(CREATED).send({ message: "Utilisateur enregistré avec succès "});
});
authRoutes.post("/login", loginHandler);

export default authRoutes;