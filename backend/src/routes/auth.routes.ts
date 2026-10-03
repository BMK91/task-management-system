import { Router } from "express";

import {
  getRefreshToken,
  loginUser,
  logoutUser,
  registerUser,
} from "@controllers/auth.controller.js";
import { authenticate } from "@middleware/auth.middleware.js";
import {
  loginValidator,
  logoutValidator,
  refreshTokenValidator,
  registerUserValidator,
} from "@validators/auth.validator.js";

const router = Router();

router.post("/register", registerUserValidator, registerUser);
router.post("/login", loginValidator, loginUser);
router.post("/logout", authenticate, logoutValidator, logoutUser);

router.get("/refresh-token", refreshTokenValidator, getRefreshToken);

export default router;
