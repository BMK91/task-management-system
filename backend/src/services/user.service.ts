import bcrypt from "bcrypt";
import fs from "fs/promises";
import { isValidObjectId } from "mongoose";
import path from "path";

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

  // const { name, email } = payload;
  const { name } = payload;

  // if (email && email !== user.email) {
  //   const existingUser = await User.findOne({
  //     email,
  //     _id: { $ne: userId },
  //   });

  //   if (existingUser) {
  //     throw new ApiError(
  //       HTTP_STATUS.CONFLICT,
  //       "EMAIL_ALREADY_EXISTS",
  //       "Email already exists",
  //     );
  //   }
  // }

  if (name !== undefined) {
    user.name = name;
  }

  // if (email !== undefined) {
  //   user.email = email;
  // }

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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
    profilePhoto: user.profilePhoto,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found",
    );
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_PASSWORD",
      "Current password is incorrect",
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "SAME_PASSWORD",
      "New password must be different from the current password",
    );
  }

  user.password = newPassword;
  await user.save();
};

const updateProfilePhoto = async (
  userId: string,
  filename: string,
): Promise<string> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found",
    );
  }

  const profilePhotoPath = path.join(
    "uploads",
    "profile-photos",
    userId,
    filename,
  );

  /*
   * Delete the previous profile photo.
   */
  if (user.profilePhoto) {
    const previousPhotoPath = path.join(process.cwd(), user.profilePhoto);

    try {
      await fs.unlink(previousPhotoPath);
    } catch (error: unknown) {
      /*
       * Ignore the error when the old file
       * does not exist.
       */
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code !== "ENOENT"
      ) {
        throw error;
      }
    }
  }

  user.profilePhoto = profilePhotoPath;

  await user.save();

  return profilePhotoPath;
};

export default {
  updateProfile,
  getCurrentUser,
  changePassword,
  updateProfilePhoto,
};
