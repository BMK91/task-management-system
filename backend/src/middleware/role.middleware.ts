import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@constants/http-status.js";
import type { UserRole } from "@constants/user.roles.js";
import { sendError } from "@utils/api-response.js";

export const requireRole =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Authentication failed",
        code: "UNAUTHORIZED",
      });

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: "You do not have permission to access this resource",
        code: "FORBIDDEN",
      });

      return;
    }

    next();
  };
