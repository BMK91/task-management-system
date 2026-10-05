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

router.get("/profile", getUserProfile);
// router.patch("/me", updateProfile);
// router.patch("/me/password", changePassword);

router.put("/profile", updateProfileValidator, updateProfile);
router.put("/change-password", changePasswordValidator, changePassword);

export default router;
