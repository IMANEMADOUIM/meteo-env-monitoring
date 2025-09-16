import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../common/constants/http";
import { z } from "zod";
import AppError from "../common/utils/appError";
import AppErrorCode from "../common/constants/appErrorCode";
import { clearAuthenticationCookies } from "../common/utils/cookies";
import { BASE_PATH } from "../common/constants/env";

// Gestion des erreurs MongoDB
const handleMongoError = (res: Response, error: any): void => {
  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue).join(", ");
    const message = `Duplicate ${duplicateField} entered.`;
    res.status(BAD_REQUEST).json({
      message,
      errorCode: AppErrorCode.DUPLICATE_KEY,
    });
    return;
  }

  res.status(BAD_REQUEST).json({
    message: "Database error occurred",
  });
};

// Gestion des erreurs de validation Zod
const handleZodError = (res: Response, error: z.ZodError): void  => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  res.status(BAD_REQUEST).json({
    message: "Validation failed",
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) =>{
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

 const REFRESH_PATH = `${BASE_PATH}auth/refresh`;

// Gestionnaire d'erreurs principal
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error(`Error on ${req.method} ${req.path}`, error);

   // Nettoyage des cookies pour certains chemins
   if (req.path === REFRESH_PATH) {
    clearAuthenticationCookies(res);
  }

  // Gestion des erreurs de syntaxe JSON
  if (error instanceof SyntaxError) {
    res.status(BAD_REQUEST).json({
      message: "Invalid JSON format, please check your request body",
    });
    return;
  }
  
  if (error instanceof z.ZodError) {
     handleZodError(res, error);
     return;
  }

  if (error instanceof AppError){
    handleAppError(res, error);
    return;
  }

    // Handle MongoDB errors (e.g., duplicate key errors)
    if (error.name === "MongoError" && error.code === 11000) {
      handleMongoError(res, error);
      return;
    }

  res.status(INTERNAL_SERVER_ERROR).json({
    message : "Internal Server Error ",
    error : error?.message || "Unkown error occured",
  });
  
};

export default errorHandler;
