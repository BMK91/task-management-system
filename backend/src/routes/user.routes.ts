import { Router } from "express";

import { authenticate } from "@middleware/auth.middleware.js";
import { updateProfileValidator } from "@validators/user.validator.js";

import { getUserProfile, updateProfile } from "@controllers/user.controller.js";

const router = Router();

// Both USER and ADMIN can access their own profile
router.use(authenticate);

router.get("/me", getUserProfile);
// router.patch("/me", updateProfile);
// router.patch("/me/password", changePassword);

router.patch(
  "/profile",
  authenticate,
  updateProfileValidator,
  updateProfile,
);

export default router;
