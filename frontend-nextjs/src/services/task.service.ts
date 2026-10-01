import { TaskSortField } from "@/components/tasks/TaskList";
import api from "@/lib/axios";

import type {
  ApiResponse,
  CreateTaskPayload,
  Task,
  TaskListData,
  TaskListParams,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "@/types/task.types";

const base_path = "/task";

export type TaskExportFormat = "pdf" | "excel";

export interface TaskExportParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: TaskSortField;
  sortOrder?: "asc" | "desc";
}

export const taskService = {
  async createTask(payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    const response = await api.post<ApiResponse<Task>>(base_path, payload);

    return response.data;
  },

  async getTasks(params: TaskListParams): Promise<ApiResponse<TaskListData>> {
    const response = await api.get<ApiResponse<TaskListData>>(base_path, {
      params,
    });

    return response.data;
  },

  async updateTask(
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<ApiResponse<Task>> {
    const response = await api.put<ApiResponse<Task>>(
      `${base_path}/${taskId}`,
      payload,
    );

    return response.data;
  },

  async deleteTask(taskId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `${base_path}/${taskId}`,
    );

    return response.data;
  },

  async exportTasks(
    format: TaskExportFormat,
    params: TaskExportParams,
  ): Promise<Blob> {
    const response = await api.get(`${base_path}/export`, {
      params: {
        ...params,
        format,
      },
      responseType: "blob",
    });

    return response.data;
  },
};
