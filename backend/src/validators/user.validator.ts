import { body } from "express-validator";

import { validate } from "@utils/validate.js";

export const updateProfileValidator = validate([
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("email")
    .optional()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
]);
