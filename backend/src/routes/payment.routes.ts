import { Router } from "express";
import {
  addPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from "../controllers/payment.controller";
import { authenticate, isVerified } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import { asyncHandler } from "../utils/express-utils";
import {
  addPaymentMethodValidation,
  updatePaymentMethodValidation,
} from "../utils/validations";

const router = Router();

// All routes require authentication and verified email
router.use(authenticate, isVerified);

// Get all payment methods
router.get("/", asyncHandler(getPaymentMethods));

// Add a payment method
router.post(
  "/",
  validate(addPaymentMethodValidation),
  asyncHandler(addPaymentMethod)
);

// Update payment method
router.put(
  "/:methodId",
  validate(updatePaymentMethodValidation),
  asyncHandler(updatePaymentMethod)
);

// Set default payment method
router.patch("/:methodId/default", asyncHandler(setDefaultPaymentMethod));

// Delete payment method
router.delete("/:methodId", asyncHandler(deletePaymentMethod));

export default router;
