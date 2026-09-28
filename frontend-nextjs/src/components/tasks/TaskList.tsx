"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { taskService } from "@/services/task.service";
import type { Task, TaskPriority, TaskStatus } from "@/types/task.types";
import {
  ArrowDownward,
  ArrowUpward,
  DeleteOutlined,
  EditOutlined,
} from "@mui/icons-material";

const PAGE_SIZE = 10;

type TaskSortField = "title" | "dueDate" | "createdAt";

type SortOrder = "asc" | "desc";

interface TaskListProps {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskList({ onEdit, onDelete }: TaskListProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [sortBy, setSortBy] = useState<TaskSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  const handleSort = (field: TaskSortField) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setPage(1);
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      "tasks",
      {
        page,
        limit: PAGE_SIZE,
        search,
        status,
        priority,
        sortBy,
        sortOrder,
      },
    ],

    queryFn: () =>
      taskService.getTasks({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const tasks = data?.data.tasks ?? [];
  const pagination = data?.data.pagination;

  return (
    <Stack spacing={2}>
      {/* Filters */}
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
      >
        <TextField
          fullWidth
          label="Search"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <FormControl
          sx={{
            minWidth: {
              xs: "100%",
              md: 180,
            },
          }}
        >
          <InputLabel>Status</InputLabel>

          <Select
            value={status}
            label="Status"
            displayEmpty
            onChange={(event) => {
              setStatus(event.target.value as TaskStatus | "");
              setPage(1);
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: {
              xs: "100%",
              md: 180,
            },
          }}
        >
          <InputLabel>Priority</InputLabel>

          <Select
            value={priority}
            label="Priority"
            displayEmpty
            onChange={(event) => {
              setPriority(event.target.value as TaskPriority | "");
              setPage(1);
            }}
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : "Unable to load tasks."}
        </Alert>
      )}

      {/* Data */}
      {!isLoading && !isError && (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: "calc(100vh - 350px)",
              overflow: "auto",
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 1000,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 4,
                      minWidth: 80,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <strong>Actions</strong>
                  </TableCell>

                  <TableCell
                    sortDirection={sortBy === "title" ? sortOrder : false}
                  >
                    <TableSortLabel
                      active={sortBy === "title"}
                      direction={sortBy === "title" ? sortOrder : "asc"}
                      onClick={() => handleSort("title")}
                      IconComponent={
                        sortBy === "title"
                          ? sortOrder === "asc"
                            ? ArrowUpward
                            : ArrowDownward
                          : ArrowUpward
                      }
                    >
                      <strong>Title</strong>
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Priority</strong>
                  </TableCell>

                  <TableCell
                    sortDirection={sortBy === "dueDate" ? sortOrder : false}
                  >
                    <TableSortLabel
                      active={sortBy === "dueDate"}
                      direction={sortBy === "dueDate" ? sortOrder : "asc"}
                      onClick={() => handleSort("dueDate")}
                    >
                      <strong>Due Date</strong>
                    </TableSortLabel>
                  </TableCell>

                  <TableCell
                    sortDirection={sortBy === "createdAt" ? sortOrder : false}
                  >
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortOrder : "desc"}
                      onClick={() => handleSort("createdAt")}
                    >
                      <strong>Created At</strong>
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography
                        sx={{
                          color: "text.secondary",
                          py: 4,
                        }}
                      >
                        No tasks found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task._id} hover>
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          backgroundColor: "background.paper",
                          width: 80,
                          minWidth: 80,
                          maxWidth: 80,
                          padding: "4px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Stack direction="row" spacing={0}>
                          <Tooltip title="Edit Task">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onEdit(task)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Task">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(task)}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {task.title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          color="text.secondary"
                          sx={{
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {task.description || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={task.status}
                          color={
                            task.status === "Completed"
                              ? "success"
                              : task.status === "In Progress"
                                ? "info"
                                : "default"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={task.priority}
                          color={
                            task.priority === "High"
                              ? "error"
                              : task.priority === "Medium"
                                ? "warning"
                                : "success"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination && pagination.totalPages > 1 && (
            <Stack
              direction="row"
              sx={{
                justifyContent: "center",
                py: 2,
              }}
            >
              <Pagination
                page={pagination.page}
                count={pagination.totalPages}
                color="primary"
                onChange={(_, value) => setPage(value)}
              />
            </Stack>
          )}

          {isFetching && !isLoading && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              Updating tasks...
            </Typography>
          )}
        </>
      )}
    </Stack>
  );
}
