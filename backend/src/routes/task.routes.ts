import { Router } from "express";

import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from "@controllers/task.controller.js";
import { authenticate } from "@middleware/auth.middleware.js";
import { validateRequest } from "@middleware/error.middleware.js";
import {
  createTaskValidator,
  taskIdValidator,
  taskListValidator,
  updateTaskValidator,
} from "@validators/task.validator.js";

const router = Router();

router.post(
  "/",
  createTaskValidator,
  validateRequest,
  authenticate,
  createTask,
);

router.get("/", taskListValidator, authenticate, getAllTasks);
router.get("/:id", taskIdValidator, authenticate, getTaskById);

router.put(
  "/:id",
  updateTaskValidator,
  validateRequest,
  authenticate,
  updateTask,
);

router.delete("/:id", authenticate, deleteTask);

export default router;
