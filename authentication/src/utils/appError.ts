import { HttpStatusCode } from "../constants/http";

class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: HttpStatusCode, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
   
    // Capture l'emplacement de l'erreur
    Error.captureStackTrace(this, this.constructor);
  }
}

new AppError(
 'msg',
  200

)

export default AppError;
