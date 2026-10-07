import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import multer from "multer";

import logger from "@config/logger.js";
import { HTTP_STATUS } from "@constants/http-status.js";
import { ApiError } from "@utils/api-error.js";
import { sendError } from "@utils/api-response.js";

import type { AppError } from "./error.types.js";

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details: Record<string, string> = {};

    for (const error of errors.array()) {
      if ("path" in error && error.path) {
        /**
         * Keep the first validation error for a field.
         * This prevents duplicate fields in the response.
         */
        if (!details[error.path]) {
          details[error.path] = error.msg;
        }
      }
    }

    sendError(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
    });

    return;
  }

  next();
};

const isMongoDuplicateKeyError = (error: unknown): error is { code: 11000 } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode =
    error.statusCode ?? error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const requestId = req.headers["x-request-id"]?.toString() ?? undefined;

  logger.error("Application Error", {
    requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,

    userId: (req as Request & { user?: { id?: string } }).user?.id,

    errorName: error.name,
    errorMessage: error.message,
    errorCode: error.code,

    details: error.details,

    stack: error.stack,
  });

  /**
   * Application errors
   */
  if (error instanceof ApiError) {
    sendError(res, {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      ...(error.details !== undefined && {
        details: error.details,
      }),
    });

    return;
  }

  /**
   * Multer file upload errors
   */
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Profile photo must not exceed 2 MB",
        code: "LIMIT_FILE_SIZE",
      });

      return;
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: `Unexpected file field: ${error.field}`,
        code: "LIMIT_UNEXPECTED_FILE",
      });

      return;
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Only one profile photo can be uploaded",
        code: "LIMIT_FILE_COUNT",
      });

      return;
    }

    sendError(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: "Invalid file upload",
      code: error.code,
    });

    return;
  }

  /**
   * MongoDB duplicate key error
   */
  if (isMongoDuplicateKeyError(error)) {
    sendError(res, {
      statusCode: HTTP_STATUS.CONFLICT,
      message: "Resource already exists",
      code: "CONFLICT",
    });

    return;
  }

  /**
   * Mongoose validation error
   */
  if (error?.name === "ValidationError") {
    const details: Record<string, string> = {};

    Object.values(error.errors ?? {}).forEach((validationError: any) => {
      details[validationError.path] = validationError.message;
    });

    sendError(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: "Database validation failed",
      code: "VALIDATION_ERROR",
      details,
    });

    return;
  }

  /**
   * JWT errors
   */
  if (
    error instanceof jwt.JsonWebTokenError ||
    error instanceof jwt.TokenExpiredError
  ) {
    sendError(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });

    return;
  }

  /**
   * Unknown/unhandled errors
   */
  sendError(res, {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};
