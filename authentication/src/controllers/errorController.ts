import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { INTERNAL_SERVER_ERROR } from "../constants/http";
import { NODE_ENV } from "../constants/env";

const errorController = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || INTERNAL_SERVER_ERROR; // Code d'erreur par défaut
  err.status = err.status || "error"; // Statut par défaut

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Something went wrong!",
    stack: NODE_ENV ? err.stack : undefined,
  });
};

export default errorController;
