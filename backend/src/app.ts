import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import morgan from "morgan";
import path from "path";

import config from "@config/config.js";
import { setupSwagger } from "@config/swagger.js";
import { errorHandler } from "@middleware/error.middleware.js";
import router from "@routes/index.js";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get(`${config.API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API is running",
    timestamp: new Date().toISOString(),
  });
});

setupSwagger(app);

// Routes
app.use(config.API_PREFIX, router);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
// const errorHandler: ErrorRequestHandler = (
//   err,
//   _req,
//   res,
//   _next: NextFunction,
// ) => {
//   console.error(err);

//   const statusCode = err.statusCode || 500;

//   res.status(statusCode).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// };

app.use(errorHandler);

export default app;
