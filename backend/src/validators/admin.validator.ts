import { param, query } from "express-validator";

import { ALL_ROLES, type UserRole } from "@constants/user.roles.js";
import { validate } from "@utils/validate.js";

const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === "string" && ALL_ROLES.includes(value as UserRole);
};

export const getAllUsersValidator = validate([
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .isString()
    .trim()
    .withMessage("Search must be a string"),

  query("role")
    .optional()
    .isString()
    .custom((value) => isUserRole(value))
    .withMessage("Invalid Role"),
]);

export const userIdValidator = validate([
  param("id").isMongoId().withMessage("Invalid user ID"),
]);
