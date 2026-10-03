import type { RequestHandler } from "express";
import type { ValidationChain } from "express-validator";

import { validateRequest } from "@middleware/error.middleware.js";

export const validate = (validations: ValidationChain[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      validateRequest(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
