import { body } from "express-validator";

// Auth validations
export const registerValidation = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("referralCode").optional().trim(),
];

export const verifyOTPValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isNumeric()
    .withMessage("OTP must be numeric")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

export const loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isNumeric()
    .withMessage("OTP must be numeric")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// New validation schema for token-based password reset
export const resetPasswordWithTokenValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// Verify reset token validation
export const verifyResetTokenValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("token").notEmpty().withMessage("Reset token is required"),
];

// User validations
export const updateProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters"),
];

// Bank account validations
export const addBankAccountValidation = [
  body("bankName").notEmpty().withMessage("Bank name is required").trim(),
  body("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Account number must be between 10 and 20 characters"),
  body("accountHolder")
    .notEmpty()
    .withMessage("Account holder name is required")
    .trim(),
];

export const updateBankAccountValidation = [
  body("bankName").optional().trim(),
  body("accountHolder").optional().trim(),
];

// Transaction validations
export const createDepositValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 5000, max: 50000 })
    .withMessage("Amount must be between 5,000 and 50,000 PKR"),
  body("paymentMethodId")
    .notEmpty()
    .withMessage("Payment method ID is required")
    .custom((value) => {
      // Allow "manual" as a valid value for manual deposits
      if (value === "manual") {
        return true;
      }

      // Otherwise it should be a valid MongoDB ID
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage("Invalid payment method ID"),
  body("transactionReference").optional().trim(),
];

export const createWithdrawalValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 5000, max: 50000 })
    .withMessage("Amount must be between 5,000 and 50,000 PKR"),
  body("paymentMethodId")
    .notEmpty()
    .withMessage("Payment method ID is required")
    .custom((value) => {
      // Allow "manual" as a valid value for manual withdrawals
      if (value === "manual") {
        return true;
      }

      // Otherwise it should be a valid MongoDB ID
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage("Invalid payment method ID"),
];

// Add a new validation for updating transaction status
export const updateTransactionStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "completed", "failed"])
    .withMessage("Invalid status value"),
  body("adminNote").optional().trim(),
];

// Trade validations
export const startTradeValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 5000, max: 50000 })
    .withMessage("Amount must be between 5,000 and 50,000 PKR"),
  body("isBot")
    .optional()
    .isBoolean()
    .withMessage("isBot must be a boolean value"),
];

// Complete trade validation
export const completeTradeValidation = [
  body("profit")
    .notEmpty()
    .withMessage("Profit is required")
    .isFloat({ min: 0 })
    .withMessage("Profit must be a positive number"),
  body("profitPercentage")
    .notEmpty()
    .withMessage("Profit percentage is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Profit percentage must be between 0 and 100"),
];

// Bot subscription validations
export const purchaseBotPlanValidation = [
  body("planId")
    .notEmpty()
    .withMessage("Plan ID is required")
    .isIn(["basic", "advanced", "pro"])
    .withMessage("Invalid plan ID"),
];

// Bot subscription request validation
export const requestBotSubscriptionValidation = [
  body("planId")
    .notEmpty()
    .withMessage("Plan ID is required")
    .isIn(["basic", "advanced", "pro"])
    .withMessage("Invalid plan ID"),
  body("paymentProofUrl")
    .notEmpty()
    .withMessage("Payment proof URL is required")
    .isURL()
    .withMessage("Payment proof must be a valid URL"),
];

// Approve or reject bot subscription validation
export const approveRejectBotSubscriptionValidation = [
  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["approve", "reject"])
    .withMessage("Action must be either 'approve' or 'reject'"),
  body("adminNote").optional().trim(),
];

// Event validations
export const createEventValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description").notEmpty().withMessage("Description is required").trim(),
];

export const updateEventValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description").optional().trim(),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// Payment method validations
export const addPaymentMethodValidation = [
  body("type")
    .notEmpty()
    .withMessage("Payment method type is required")
    .isIn(["bank", "easypaisa", "jazzcash"])
    .withMessage(
      "Invalid payment method type. Must be one of: bank, easypaisa, jazzcash"
    ),
  body("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .trim()
    .custom((value, { req }) => {
      if (req.body.type === "bank") {
        // Bank account number format (simplified)
        if (value.length < 10 || value.length > 20) {
          throw new Error(
            "Bank account number must be between 10 and 20 characters"
          );
        }
      } else if (
        req.body.type === "easypaisa" ||
        req.body.type === "jazzcash"
      ) {
        // Pakistani mobile number format
        const mobileRegex = /^(03\d{9})$/;
        if (!mobileRegex.test(value)) {
          throw new Error("Mobile number must be in format: 03XXXXXXXXX");
        }
      }
      return true;
    }),
  body("accountTitle")
    .notEmpty()
    .withMessage("Account title/holder name is required")
    .trim(),
  body("bankName").custom((value, { req }) => {
    if (req.body.type === "bank" && !value) {
      throw new Error("Bank name is required for bank accounts");
    }
    return true;
  }),
];

export const updatePaymentMethodValidation = [
  body("accountTitle").optional().trim(),
  body("bankName").optional().trim(),
];
