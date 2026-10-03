import ms, { type StringValue } from "ms";

import config from "@config/config.js";
import { HTTP_STATUS } from "@constants/http-status.js";
import { USER_ROLES } from "@constants/user.roles.js";
import RefreshToken from "@models/refresh-token.model.js";
import User from "@models/user.model.js";
import { ApiError } from "@utils/api-error.js";
import { hashToken } from "@utils/common.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@utils/jwt.js";

import type {
  LoginUserInput,
  LoginUserResponse,
  RegisterUserInput,
  RegisterUserResponse,
} from "./auth.types.js";

const loginUser = async (
  payload: LoginUserInput,
): Promise<LoginUserResponse> => {
  const email = payload.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
      "Invalid email or password",
    );
  }

  const isPasswordValid = await user.comparePassword(payload.password);

  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
      "Invalid email or password",
    );
  }

  const userId = user._id.toString();

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const tokenHash = hashToken(refreshToken);

  const refreshTokenExpiresInMs = ms(
    config.JWT_REFRESH_EXPIRES_IN as StringValue,
  );

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
  });

  return {
    user: {
      id: userId,
      name: user.name,
      email: user.email,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

const registerUser = async (
  payload: RegisterUserInput,
): Promise<RegisterUserResponse> => {
  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "CONFLICT",
      "Email already registered",
    );
  }

  const user = await User.create({
    name,
    email,
    password: payload.password,
    role: USER_ROLES.USER,
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

const logoutUser = async (
  refreshToken: string,
  userId: string,
): Promise<void> => {
  const payload = verifyRefreshToken(refreshToken);

  if (payload.sub !== userId) {
    throw new Error("Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);

  await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export default { loginUser, logoutUser, registerUser };
