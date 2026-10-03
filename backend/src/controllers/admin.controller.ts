import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@constants/http-status.js";
import { type UserRole } from "@constants/user.roles.js";
import adminService from "@services/admin.service.js";
import { sendSuccess } from "@utils/api-response.js";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const role =
      typeof req.query.role === "string"
        ? (req.query.role as UserRole)
        : undefined;

    const result = await adminService.getAllUsers(
      req.user!.id,
      page,
      limit,
      search,
      role,
    );

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await adminService.getUserById(String(id));

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Uses fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await adminService.deleteUser(String(id), req.user!.id);

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Uses deleted successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
