import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@constants/http-status.js";
import dashboardService from "@services/dashboard.service.js";
import { sendSuccess } from "@utils/api-response.js";

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const statistics = await dashboardService.getDashboardStatistics();

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Dashboard statistics fetched successfully",
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};
