"use client";

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useNotification } from "@/providers/NotificationProvider";
import { taskSchema } from "@/schemas/task.schema";
import { taskService } from "@/services/task.service";
import { getApiErrorMessage } from "@/utils/api-error";

import type { Task, TaskPriority, TaskStatus } from "@/types/task.types";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export default function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { showSuccess, showError } = useNotification();
  const isEditMode = Boolean(task);

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,

    onSuccess: () => {
      showSuccess("Task created successfully");
      form.reset();
      onSuccess?.();
    },

    onError: (error: unknown) => {
      showError(
        getApiErrorMessage(error, "Unable to create task. Please try again."),
      );
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Parameters<typeof taskService.updateTask>[1];
    }) => taskService.updateTask(taskId, payload),

    onSuccess: () => {
      showSuccess("Task updated successfully");
      onSuccess?.();
    },

    onError: (error: unknown) => {
      showError(
        getApiErrorMessage(error, "Unable to update task. Please try again."),
      );
    },
  });

  console.log({ task });

  const form = useForm({
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? ("Pending" as TaskStatus),
      priority: task?.priority ?? ("Medium" as TaskPriority),
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
    },

    validators: {
      onSubmit: taskSchema,
    },

    onSubmit: async ({ value }) => {
      const payload = {
        title: value.title.trim(),
        description: value.description.trim() || "",
        status: value.status,
        priority: value.priority,
        dueDate: value.dueDate,
      };

      console.log({ value, payload });

      if (isEditMode && task) {
        await updateTaskMutation.mutateAsync({
          taskId: task._id,
          payload,
        });

        return;
      }

      await createTaskMutation.mutateAsync(payload);
    },
  });

  const isSubmitting =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Stack spacing={2.5}>
        {/* Title */}
        <form.Field
          name="title"
          children={(field) => (
            <TextField
              fullWidth
              label="Title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              helperText={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : ""
              }
            />
          )}
        />

        {/* Description */}
        <form.Field
          name="description"
          children={(field) => (
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              helperText={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : ""
              }
            />
          )}
        />

        {/* Status */}
        <form.Field
          name="status"
          children={(field) => (
            <FormControl
              fullWidth
              required
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={field.state.value}
                label="Status"
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value as TaskStatus)
                }
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>

              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <FormHelperText>
                    {field.state.meta.errors[0]?.message}
                  </FormHelperText>
                )}
            </FormControl>
          )}
        />

        {/* Priority */}
        <form.Field
          name="priority"
          children={(field) => (
            <FormControl
              fullWidth
              required
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
            >
              <InputLabel>Priority</InputLabel>

              <Select
                value={field.state.value}
                label="Priority"
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value as TaskPriority)
                }
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>

              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <FormHelperText>
                    {field.state.meta.errors[0]?.message}
                  </FormHelperText>
                )}
            </FormControl>
          )}
        />

        {/* Due Date */}
        <form.Field
          name="dueDate"
          children={(field) => (
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={field.state.value ? field.state.value.slice(0, 10) : ""}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              helperText={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : ""
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          )}
        />

        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={() => (
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEditMode ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          )}
        />
      </Stack>
    </Box>
  );
}
