import { Types, type QueryFilter, type SortOrder } from "mongoose";

import { HTTP_STATUS } from "@constants/http-status.js";
import Task, {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type ITask,
  type TaskPriority,
  type TaskStatus,
} from "@models/task.model.js";
import { ApiError } from "@utils/api-error.js";
import {
  generateTasksExcel,
  generateTasksPdf,
} from "@utils/task-export.util.js";

import type {
  CreateTaskRequest,
  GetTasksParams,
  TaskExportFormat,
  TaskExportQuery,
} from "./task.types.js";

interface CreateTaskServiceInput extends CreateTaskRequest {
  createdBy: NonNullable<Express.Request["user"]>["id"];
}

const createTask = async ({
  title,
  description,
  status,
  priority,
  dueDate,
  createdBy,
}: CreateTaskServiceInput) => {
  const task = await Task.create({
    title,
    ...(description !== undefined && { description }),
    ...(status !== undefined && { status }),
    ...(priority !== undefined && { priority }),
    ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
    createdBy,
  });

  return task;
};

const getAllTasks = async ({
  createdBy,
  page,
  limit,
  search,
  status,
  priority,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetTasksParams) => {
  const filter: QueryFilter<ITask> = {
    createdBy,
  };

  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  const skip = (page - 1) * limit;

  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  } as Record<string, 1 | -1>;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit).lean(),

    Task.countDocuments(filter),
  ]);

  return {
    tasks,
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

const getTaskById = async (taskId: string) => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_TASK_ID",
      "Invalid task ID",
    );
  }

  const task = await Task.findById(taskId).lean();

  if (!task) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "TASK_NOT_FOUND",
      "Task not found",
    );
  }

  return task;
};

const updateTask = async (
  taskId: string,
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  },
) => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_TASK_ID",
      "Invalid task ID",
    );
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "TASK_NOT_FOUND",
      "Task not found",
    );
  }

  Object.assign(task, data);

  await task.save();

  return task.toObject();
};

const deleteTask = async (taskId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_TASK_ID",
      "Invalid task ID",
    );
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "TASK_NOT_FOUND",
      "Task not found",
    );
  }

  await Task.findByIdAndDelete(taskId);
};

const exportTasks = async (
  userId: string,
  format: TaskExportFormat,
  query: TaskExportQuery,
): Promise<Buffer> => {
  const filter: QueryFilter<ITask> = {
    createdBy: userId,
  };

  /**
   * Search by title and description.
   */
  if (query.search?.trim()) {
    const search = query.search.trim();

    filter.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  /**
   * Filter by status.
   */
  if (query.status) {
    if (
      TASK_STATUSES.includes(query.status as (typeof TASK_STATUSES)[number])
    ) {
      filter.status = query.status as TaskStatus;
    }
  }

  /**
   * Filter by priority.
   */
  if (query.priority) {
    if (
      TASK_PRIORITIES.includes(
        query.priority as (typeof TASK_PRIORITIES)[number],
      )
    ) {
      filter.priority = query.priority as TaskPriority;
    }
  }

  /**
   * Sorting.
   */
  const allowedSortFields = [
    "title",
    "dueDate",
    "createdAt",
    "updatedAt",
  ] as const;

  const sortBy = allowedSortFields.includes(
    query.sortBy as (typeof allowedSortFields)[number],
  )
    ? query.sortBy!
    : "createdAt";

  const sortOrder: SortOrder = query.sortOrder === "asc" ? 1 : -1;

  const tasks = await Task.find(filter)
    .select("title description status priority dueDate createdAt updatedAt")
    .sort({
      [sortBy]: sortOrder,
    })
    .lean();

  if (format === "excel") {
    return generateTasksExcel(tasks);
  }

  return generateTasksPdf(tasks);
};

export default {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  exportTasks,
};
