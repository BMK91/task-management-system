import { Router } from "express";

import { USER_ROLES } from "@constants/user.roles.js";
import { authenticate } from "@middleware/auth.middleware.js";
import { requireRole } from "@middleware/role.middleware.js";

import {
  deleteUser,
  getAllUsers,
  getUserById,
} from "@controllers/admin.controller.js";
import {
  getAllUsersValidator,
  userIdValidator,
} from "@validators/admin.validator.js";

const router = Router();

// All routes require an authenticated administrator
router.use(authenticate, requireRole(USER_ROLES.ADMIN));

router.get("/users", getAllUsersValidator, getAllUsers);
router.get("/user/:id", userIdValidator, getUserById);

router.delete("/user/:id", userIdValidator, deleteUser);

export default router;
