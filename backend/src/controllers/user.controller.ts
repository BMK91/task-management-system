import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@constants/http-status.js";
import userService from "@services/user.service.js";
import { sendError, sendSuccess } from "@utils/api-response.js";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Unauthorised for this request.",
        code: "UNAUTHORIZED",
      });

      return;
    }

    const user = await userService.getCurrentUser(req.user.id);

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Unauthorised for this request.",
        code: "UNAUTHORIZED",
      });

      return;
    }

    const result = await userService.updateProfile(userId, req.body);

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
