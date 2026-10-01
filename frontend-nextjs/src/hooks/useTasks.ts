import { useMutation } from "@tanstack/react-query";

import {
  TaskExportFormat,
  TaskExportParams,
  taskService,
} from "@/services/task.service";

export const useExportTasks = () => {
  return useMutation({
    mutationFn: ({
      format,
      params,
    }: {
      format: TaskExportFormat;
      params: TaskExportParams;
    }) => taskService.exportTasks(format, params),
  });
};
