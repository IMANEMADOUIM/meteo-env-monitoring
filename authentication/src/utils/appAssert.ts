import assert from "assert";
import AppErrorCode from "../constants/appErrorCode";
import AppError from "./appError";
import { HttpStatusCode } from "../constants/http";

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

/**
 * Asserts a condition and throw an AppError if the condition is falsy.
 */
const appAssert:AppAssert = (
  condition: any,
  httpStatusCode,
  message,
  appErrorCode

) => assert( condition, new AppError( httpStatusCode, message, appErrorCode));

export default appAssert;