import { Router } from "express";
import {
  updateProfile,
  updateProfileImage,
  getDashboard,
  getReferrals,
  getAllUsers,
  deleteUser,
  getUserById,
} from "../controllers/user.controller";
import { authenticate, isVerified, isAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import { updateProfileValidation } from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";
import { profileImageUpload } from "../utils/upload";
import { getUserPaymentMethods } from "../controllers/payment.controller";

const router = Router();

// All routes require authentication
router.use(authenticate, isVerified);

// User profile routes
router.put(
  "/profile",
  validate(updateProfileValidation),
  asyncHandler(updateProfile)
);
router.put(
  "/profile/image",
  profileImageUpload.single("profileImage"),
  asyncHandler(updateProfileImage)
);

// Dashboard route
router.get("/dashboard", asyncHandler(getDashboard));

// Referrals route
router.get("/referrals", asyncHandler(getReferrals));

// Admin routes
router.get("/all", isAdmin, asyncHandler(getAllUsers));
router.get("/:userId", isAdmin, asyncHandler(getUserById));
router.get(
  "/:userId/payment-methods",
  isAdmin,
  asyncHandler(getUserPaymentMethods)
);
router.delete("/:userId", isAdmin, asyncHandler(deleteUser));

export default router;
