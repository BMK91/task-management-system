"use client";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { useNotification } from "@/providers/NotificationProvider";
import { taskService } from "@/services/task.service";
import type { Task } from "@/types/task.types";
import { getApiErrorMessage } from "@/utils/api-error";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskCreated = async () => {
    setCreateDialogOpen(false);

    await queryClient.invalidateQueries({
      queryKey: ["tasks"],
    });
  };

  const handleTaskUpdated = async () => {
    setEditDialogOpen(false);
    setSelectedTask(null);

    await queryClient.invalidateQueries({
      queryKey: ["tasks"],
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTask) {
      return;
    }

    deleteTaskMutation.mutate(selectedTask._id);
  };

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),

    onSuccess: async () => {
      showSuccess("Task deleted successfully");

      setDeleteDialogOpen(false);
      setSelectedTask(null);

      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },

    onError: (error: unknown) => {
      showError(
        getApiErrorMessage(error, "Unable to delete task. Please try again."),
      );
    },
  });

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Tasks
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create and manage your tasks.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Task
          </Button>
        </Stack>

        {/* Task List */}
        <TaskList onEdit={handleEdit} onDelete={handleDelete} />
      </Stack>

      {/* Create Task Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Create Task
            </Typography>

            <IconButton
              aria-label="Close"
              onClick={() => setCreateDialogOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pb: 3 }}>
          <TaskForm onSuccess={handleTaskCreated} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "700" }}>
              Update Task
            </Typography>

            <IconButton onClick={() => setEditDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {selectedTask && (
            <TaskForm task={selectedTask} onSuccess={handleTaskUpdated} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Task</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{selectedTask?.title}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteTaskMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteTaskMutation.isPending}
            startIcon={
              deleteTaskMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
