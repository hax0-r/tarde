import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import bankRoutes from "./bank.routes";
import transactionRoutes from "./transaction.routes";
import tradeRoutes from "./trade.routes";
import botRoutes from "./bot.routes";
import eventRoutes from "./event.routes";
import paymentRoutes from "./payment.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

// Register all routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/banks", bankRoutes);
router.use("/payments", paymentRoutes);
router.use("/transactions", transactionRoutes);
router.use("/trades", tradeRoutes);
router.use("/bots", botRoutes);
router.use("/events", eventRoutes);
router.use("/uploads", uploadRoutes);

export default router;
