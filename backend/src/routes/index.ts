import { Router } from "express";

import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import taskRoutes from "./task.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/task", taskRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
