import { Router } from "express";
import {
  addBankAccount,
  getBankAccounts,
  updateBankAccount,
  setDefaultBankAccount,
  deleteBankAccount,
} from "../controllers/bank.controller";
import { authenticate, isVerified } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  addBankAccountValidation,
  updateBankAccountValidation,
} from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// All routes require authentication and verified email
router.use(authenticate, isVerified);

// Bank account routes
router.post(
  "/",
  validate(addBankAccountValidation),
  asyncHandler(addBankAccount)
);
router.get("/", asyncHandler(getBankAccounts));
router.put(
  "/:accountId",
  validate(updateBankAccountValidation),
  asyncHandler(updateBankAccount)
);
router.put("/:accountId/default", asyncHandler(setDefaultBankAccount));
router.delete("/:accountId", asyncHandler(deleteBankAccount));

export default router;
