import { Router } from "express";
import {
  register,
  verifyOTP,
  login,
  forgotPassword,
  getProfile,
  verifyResetToken,
  resetPasswordWithToken,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  registerValidation,
  verifyOTPValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordWithTokenValidation,
  verifyResetTokenValidation,
} from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// Public routes
router.post("/register", validate(registerValidation), asyncHandler(register));
router.post(
  "/verify-otp",
  validate(verifyOTPValidation),
  asyncHandler(verifyOTP)
);
router.post("/login", validate(loginValidation), asyncHandler(login));
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  asyncHandler(forgotPassword)
);

// New password reset endpoints
router.post(
  "/verify-reset-token",
  validate(verifyResetTokenValidation),
  asyncHandler(verifyResetToken)
);
router.post(
  "/reset-password-with-token",
  validate(resetPasswordWithTokenValidation),
  asyncHandler(resetPasswordWithToken)
);

// Protected routes
router.get("/profile", authenticate, asyncHandler(getProfile));

export default router;
