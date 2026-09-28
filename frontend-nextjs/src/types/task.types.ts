export const TASK_STATUSES = ["Pending", "In Progress", "Completed"] as const;

export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
}

export type UpdateTaskPayload = CreateTaskPayload;

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

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListData {
  tasks: Task[];
  pagination: TaskPagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
