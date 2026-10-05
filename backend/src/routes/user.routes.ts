import { Router } from "express";

import {
  changePassword,
  getUserProfile,
  updateProfile,
} from "@controllers/user.controller.js";
import { authenticate } from "@middleware/auth.middleware.js";
import {
  changePasswordValidator,
  updateProfileValidator,
} from "@validators/user.validator.js";

const router = Router();

// Both USER and ADMIN can access their own profile
router.use(authenticate);

router.get("/me", getUserProfile);
// router.patch("/me", updateProfile);
// router.patch("/me/password", changePassword);

router.patch("/profile", authenticate, updateProfileValidator, updateProfile);
router.patch("/change-password", changePasswordValidator, changePassword);

export default router;
