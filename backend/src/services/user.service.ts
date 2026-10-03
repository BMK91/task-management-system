import { isValidObjectId } from "mongoose";

import { HTTP_STATUS } from "@constants/http-status.js";
import User from "@models/user.model.js";
import { ApiError } from "@utils/api-error.js";

type UpdateProfileInput = {
  name?: string;
  email?: string;
};

const updateProfile = async (userId: string, payload: UpdateProfileInput) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_USER_ID",
      "Invalid user ID",
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found",
    );
  }

  const { name, email } = payload;

  if (email && email !== user.email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "EMAIL_ALREADY_EXISTS",
        "Email already exists",
      );
    }
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (email !== undefined) {
    user.email = email;
  }

  try {
    await user.save();
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "EMAIL_ALREADY_EXISTS",
        "Email already exists",
      );
    }

    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found",
    );
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export default { updateProfile, getCurrentUser };
