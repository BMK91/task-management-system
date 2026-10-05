import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@constants/http-status.js";
import RefreshToken from "@models/refresh-token.model.js";
import authService from "@services/auth.service.js";
import { sendError, sendSuccess } from "@utils/api-response.js";
import { hashToken } from "@utils/common.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@utils/jwt.js";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password,
    });

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Logged-in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerUser({
      name,
      email,
      password,
    });

    sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.headers["x-refresh-token"] as string;

    await authService.logoutUser(refreshToken, req.user!.id);

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers["x-refresh-token"] as string;

    const { sub } = verifyRefreshToken(token);

    const tokenHash = hashToken(token);

    // Check whether refresh token was revoked during logout.
    const user = await RefreshToken.findOne({
      userId: sub,
      tokenHash,
    }).select("revokedAt");

    if (!user || user?.revokedAt !== null) {
      sendError(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Refresh token has been revoked or is invalid.",
        code: "REFRESH_TOKEN_INVALID",
      });

      return;
    }

    const accessToken = generateAccessToken(sub);
    const newRefreshToken = generateRefreshToken(sub);

    // Rotate refresh token.
    const newTokenHash = hashToken(newRefreshToken);

    user.tokenHash = newTokenHash;
    await user.save();

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Tokens refreshed successfully.",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
