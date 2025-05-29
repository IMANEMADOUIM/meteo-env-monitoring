import AppErrorCode from "../common/constants/appErrorCode";
import { BAD_REQUEST, HttpStatusCode, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from "../common/constants/http";
import AppError from "../common/utils/appError";


export class NotFoundException extends AppError {
  constructor(message = "Resource not found", errorCode?: AppErrorCode) {
    super(
      NOT_FOUND,
      message,
      errorCode || AppErrorCode.RESSOURCE_NOT_FOUND
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: AppErrorCode) {
    super( BAD_REQUEST,
      message,
      errorCode || AppErrorCode.AUTH_USER_NOT_FOUND
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode?:  AppErrorCode) {
    super(
      UNAUTHORIZED,
      message,
      errorCode || AppErrorCode.ACCESS_UNAUTHORIZED
    );
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal Server Error", errorCode?:  AppErrorCode) {
    super(
      INTERNAL_SERVER_ERROR,
      message,
      errorCode || AppErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCode,
    errorCode?:  AppErrorCode
  ) {
    super( statusCode, message, errorCode);
  }
}
