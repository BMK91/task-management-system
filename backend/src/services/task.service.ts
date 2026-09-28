import { Types, type QueryFilter } from "mongoose";

import { HTTP_STATUS } from "@constants/http-status.js";
import Task, { type ITask } from "@models/task.model.js";
import { ApiError } from "@utils/api-error.js";
import type { CreateTaskRequest, GetTasksParams } from "./task.types.js";

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

export default { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
