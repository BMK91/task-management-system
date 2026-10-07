import type { ValidationError } from "express-validator";

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
  details?: unknown;
  errors?: Record<string, ValidationError>;
}
