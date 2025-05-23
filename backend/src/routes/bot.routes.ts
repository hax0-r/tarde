import { Router } from "express";
import {
  getBotPlans,
  purchaseBotPlan,
  getActiveBotSubscription,
  cancelBotSubscription,
  requestBotSubscription,
  approveRejectBotSubscription,
  getBotSubscriptionRequests,
} from "../controllers/bot.controller";
import { authenticate, isVerified, isAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  purchaseBotPlanValidation,
  requestBotSubscriptionValidation,
  approveRejectBotSubscriptionValidation,
} from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// Public routes
router.get("/plans", asyncHandler(getBotPlans));

// Auth routes
router.use("/subscription", authenticate, isVerified);
router.use("/request-subscription", authenticate, isVerified);
router.use("/cancel-subscription", authenticate, isVerified);
router.use("/purchase", authenticate, isVerified);

// Bot subscription routes
router.get("/subscription", asyncHandler(getActiveBotSubscription));
router.post("/cancel-subscription", asyncHandler(cancelBotSubscription));
router.post(
  "/request-subscription",
  validate(requestBotSubscriptionValidation),
  asyncHandler(requestBotSubscription)
);
router.post(
  "/purchase",
  validate(purchaseBotPlanValidation),
  asyncHandler(purchaseBotPlan)
);

// Admin routes
router.use("/admin", authenticate, isAdmin);
router.get("/admin/subscriptions", asyncHandler(getBotSubscriptionRequests));
router.put(
  "/admin/subscriptions/:subscriptionId",
  validate(approveRejectBotSubscriptionValidation),
  asyncHandler(approveRejectBotSubscription)
);

export default router;
