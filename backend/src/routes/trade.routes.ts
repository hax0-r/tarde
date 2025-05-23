import { Router } from "express";
import {
  startTrade,
  getTrades,
  getTradeById,
  getGraphData,
  completeTrade,
} from "../controllers/trade.controller";
import { authenticate, isVerified } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  startTradeValidation,
  completeTradeValidation,
} from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// All routes require authentication and verified email
router.use(authenticate, isVerified);

// Start a new trade
router.post("/start", validate(startTradeValidation), asyncHandler(startTrade));

// Get all trades
router.get("/", asyncHandler(getTrades));

// Get trade by ID
router.get("/:tradeId", asyncHandler(getTradeById));

// Get graph data
router.get("/graph/data", asyncHandler(getGraphData));

// Complete a trade
router.post(
  "/:tradeId/complete",
  validate(completeTradeValidation),
  asyncHandler(completeTrade)
);

export default router;
