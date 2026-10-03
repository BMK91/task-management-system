import mongoose from "mongoose";

import { HTTP_STATUS } from "@constants/http-status.js";
import type { UserRole } from "@constants/user.roles.js";
import User from "@models/user.model.js";
import { ApiError } from "@utils/api-error.js";

export class AdminServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AdminServiceError";
  }
}

const getAllUsers = async (
  currentUserId: string,
  page: number,
  limit: number,
  search?: string,
  role?: UserRole,
) => {
  const skip = (page - 1) * limit;

  const filter: mongoose.QueryFilter<any> = {
    _id: { $ne: currentUserId },
  };

  if (role) {
    filter.role = role;
  }

  if (search?.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const getUserById = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AdminServiceError("Invalid user ID", 400);
  }

  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  return user;
};

const updateUserRole = async (
  userId: string,
  role: UserRole,
  adminId: string,
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AdminServiceError("Invalid user ID", 400);
  }

  if (!["ADMIN", "USER"].includes(role)) {
    throw new AdminServiceError("Invalid role", 400);
  }

  if (userId === adminId && role !== "ADMIN") {
    throw new AdminServiceError("You cannot remove your own admin role", 403);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  if (user.role === "ADMIN" && role === "USER") {
    const adminCount = await User.countDocuments({
      role: "ADMIN",
      isActive: { $ne: false },
    });

    if (adminCount <= 1) {
      throw new AdminServiceError("Cannot demote the last active admin", 409);
    }
  }

  user.role = role;
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const deleteUser = async (userId: string, adminId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_USER_ID",
      "Invalid user ID",
    );
  }

  if (userId === adminId) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "FORBIDDEN",
      "You cannot delete your own account",
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  if (user.role === "ADMIN" && user.isActive !== false) {
    const adminCount = await User.countDocuments({
      role: "ADMIN",
      isActive: { $ne: false },
    });

    if (adminCount <= 1) {
      throw new AdminServiceError("Cannot delete the last active admin", 409);
    }
  }

  await user.deleteOne();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
