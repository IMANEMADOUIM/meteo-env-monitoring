import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";

class AppError extends Error {
  statusCode: HttpStatusCode ;
  errorCode?: AppErrorCode
  status: any;

  constructor(statusCode: HttpStatusCode,message: string,  errorCode?: AppErrorCode) {
    super(message);
    this.statusCode = statusCode;
    // this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errorCode = errorCode ;
    // Capture l'emplacement de l'erreur
     Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
