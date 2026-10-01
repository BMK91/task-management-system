import type { NextFunction, Request, Response } from "express";

import { HTTP_STATUS } from "@constants/http-status.js";
import type { TaskPriority, TaskStatus } from "@models/task.model.js";
import taskService from "@services/task.service.js";
import type {
  TaskExportFormat,
  TaskExportQuery,
  TaskSortBy,
} from "@services/task.types.js";
import { sendError, sendSuccess } from "@utils/api-response.js";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    req.body.dueDate =
      req.body.dueDate && !Number.isNaN(Date.parse(req.body.dueDate))
        ? req.body.dueDate
        : undefined;

    const task = await taskService.createTask({
      ...req.body,
      createdBy: req.user?.id,
    });

    sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (
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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const priority =
      typeof req.query.priority === "string" ? req.query.priority : undefined;

    const sortBy =
      typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;

    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    const result = await taskService.getAllTasks({
      createdBy: req.user.id,
      page,
      limit,
      ...(search !== undefined && { search }),
      ...(status !== undefined && {
        status: status as TaskStatus,
      }),
      ...(priority !== undefined && {
        priority: priority as TaskPriority,
      }),
      ...(sortBy !== undefined && {
        sortBy: sortBy as TaskSortBy,
      }),
      sortOrder,
    });

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Tasks retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await taskService.getTaskById(String(id));

    sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: "Tasks fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const task = await taskService.updateTask(String(req.params.id), req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await taskService.deleteTask(String(req.params.id));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const exportTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    const format = req.query.format as TaskExportFormat;

    if (format !== "excel" && format !== "pdf") {
      res.status(400).json({
        success: false,
        message: "Export format must be either excel or pdf.",
      });

      return;
    }

    const query: TaskExportQuery = {};

    if (typeof req.query.search === "string") {
      query.search = req.query.search;
    }

    if (typeof req.query.status === "string") {
      query.status = req.query.status;
    }

    if (typeof req.query.priority === "string") {
      query.priority = req.query.priority;
    }

    if (typeof req.query.sortBy === "string") {
      query.sortBy = req.query.sortBy as TaskExportQuery["sortBy"];
    }

    if (typeof req.query.sortOrder === "string") {
      query.sortOrder = req.query.sortOrder as TaskExportQuery["sortOrder"];
    }

    const file = await taskService.exportTasks(userId, format, query);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    if (format === "excel") {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="tasks-${timestamp}.xlsx"`,
      );
    } else {
      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="tasks-${timestamp}.pdf"`,
      );
    }

    res.setHeader("Content-Length", file.length);

    res.status(200).send(file);
  } catch (error) {
    next(error);
  }
};
