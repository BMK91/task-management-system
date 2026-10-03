import { Router } from "express";

import { USER_ROLES } from "@constants/user.roles.js";
import {
  createTask,
  deleteTask,
  exportTasks,
  getAllTasks,
  getTaskById,
  updateTask,
} from "@controllers/task.controller.js";
import { authenticate } from "@middleware/auth.middleware.js";
import { requireRole } from "@middleware/role.middleware.js";
import {
  createTaskValidator,
  exportTasksValidator,
  taskIdValidator,
  taskListValidator,
  updateTaskValidator,
} from "@validators/task.validator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requireRole(USER_ROLES.USER, USER_ROLES.ADMIN),
  createTaskValidator,
  createTask,
);

router.get(
  "/",
  requireRole(USER_ROLES.USER, USER_ROLES.ADMIN),
  taskListValidator,
  getAllTasks,
);
router.get("/export", exportTasksValidator, exportTasks);
router.get("/:id", taskIdValidator, getTaskById);

router.put("/:id", updateTaskValidator, updateTask);

router.delete("/:id", taskIdValidator, deleteTask);

export default router;
