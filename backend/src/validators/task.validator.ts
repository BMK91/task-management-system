import { body, param, query } from "express-validator";

import { TASK_PRIORITIES, TASK_STATUSES } from "@models/task.model.js";
import { TASK_SORT_BY } from "@services/task.types.js";
import { SORT_ORDER } from "../types/common.types.js";

/**

* Validation rules for creating a task.
  */
export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters."),

  body("status")
    .optional()
    .trim()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be ${TASK_STATUSES.join(", ")}`),

  body("priority")
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be ${TASK_PRIORITIES.join(", ")}`),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date."),
];

/**

* Validation rules for updating a task.
  */
export const updateTaskValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Task ID is required.")
    .isMongoId()
    .withMessage("Invalid task ID."),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters."),

  body("status")
    .optional()
    .trim()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be ${TASK_STATUSES.join(", ")}`),

  body("priority")
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be ${TASK_PRIORITIES.join(", ")}`),

  body("dueDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("Due date must be a valid ISO 8601 date."),
];

/**

* Validation rules for getting a task by ID.
  */
export const taskIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Task ID is required.")
    .isMongoId()
    .withMessage("Invalid task ID."),
];

/**

* Validation rules for task listing/filtering.
  */
export const taskListValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer.")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100.")
    .toInt(),

  query("status")
    .optional()
    .trim()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be ${TASK_STATUSES.join(", ")}`),

  query("priority")
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be ${TASK_PRIORITIES.join(", ")}`),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search must not exceed 100 characters."),

  query("sortBy")
    .optional()
    .trim()
    .isIn(TASK_SORT_BY)
    .withMessage(
      `Invalid sort field. It should be one of ${TASK_SORT_BY.join(", ")}`,
    ),

  query("sortOrder")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(SORT_ORDER)
    .withMessage(`Sort order must be ${SORT_ORDER.join(" or ")}`),
];
