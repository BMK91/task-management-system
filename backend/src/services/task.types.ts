import type { ITask, TaskPriority, TaskStatus } from "@models/task.model.js";
import type { SortOrder } from "../types/common.types.js";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate: string;
}

export const TASK_SORT_BY = [
  "title",
  "status",
  "priority",
  "dueDate",
  "createdAt",
  "updatedAt",
] as const;

export type TaskSortBy = (typeof TASK_SORT_BY)[number];

export interface GetTasksParams {
  createdBy: string;
  page: number;
  limit: number;
  search?: string;
  status?: ITask["status"];
  priority?: ITask["priority"];
  sortBy?: TaskSortBy;
  sortOrder?: SortOrder;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?:
    | "title"
    | "status"
    | "priority"
    | "dueDate"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
}
