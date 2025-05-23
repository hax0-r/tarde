import { Router } from "express";
import {
  createDeposit,
  createWithdrawal,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
} from "../controllers/transaction.controller";
import { authenticate, isVerified, isAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  createDepositValidation,
  createWithdrawalValidation,
  updateTransactionStatusValidation,
} from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// All routes require authentication and verified email
router.use(authenticate, isVerified);

// Transaction routes
router.post(
  "/deposit",
  validate(createDepositValidation),
  asyncHandler(createDeposit)
);
router.post(
  "/withdrawal",
  validate(createWithdrawalValidation),
  asyncHandler(createWithdrawal)
);
router.get("/", asyncHandler(getTransactions));
router.get("/:transactionId", asyncHandler(getTransactionById));

// Admin routes
router.put(
  "/:transactionId/status",
  isAdmin,
  validate(updateTransactionStatusValidation),
  asyncHandler(updateTransactionStatus)
);

export default router;
