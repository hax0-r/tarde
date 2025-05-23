import { Request, Response } from "express";
import { IUser } from "../models/User";
import Trade, { TradeStatus } from "../models/Trade";
import BotSubscription from "../models/BotSubscription";
import User from "../models/User";

// Start a new trade
export const startTrade = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { amount, isBot } = req.body;

    // Validate amount
    if (!amount || amount < 5000 || amount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Trade amount must be between 5,000 and 50,000 PKR",
      });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance to start this trade",
      });
    }

    let profitPercentage = 10; // Default profit percentage (10%)
    let botType = null;

    // Check if user wants to use bot and has active subscription
    if (isBot) {
      const activeBotSubscription = await BotSubscription.findOne({
        userId: user._id,
        isActive: true,
        endDate: { $gte: new Date() },
      });

      if (!activeBotSubscription) {
        return res.status(403).json({
          success: false,
          message: "You do not have an active bot subscription",
        });
      }

      // Set profit percentage based on bot type
      profitPercentage = activeBotSubscription.profitPercentage;
      botType = activeBotSubscription.botType;
    }

    // Calculate profit amount
    const profitAmount = amount * (profitPercentage / 100);

    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Create new trade
    const trade = new Trade({
      userId: user._id,
      amount,
      profitPercentage,
      profitAmount,
      startDate: new Date(),
      endDate,
      status: TradeStatus.ACTIVE,
      isBot: isBot || false,
      botType,
    });

    await trade.save();

    // Update user's balance
    user.balance -= amount;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Trade started successfully",
      data: {
        tradeId: trade._id,
        amount: trade.amount,
        profitPercentage: trade.profitPercentage,
        profitAmount: trade.profitAmount,
        startDate: trade.startDate,
        endDate: trade.endDate,
        status: trade.status,
        isBot: trade.isBot,
        botType: trade.botType,
      },
    });
  } catch (error) {
    console.error("Start trade error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while starting trade",
    });
  }
};

// Get all trades
export const getTrades = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { status, isBot, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter: any = { userId: user._id };

    if (status) {
      filter.status = status;
    }

    if (isBot !== undefined) {
      filter.isBot = isBot === "true";
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get trades with pagination
    const trades = await Trade.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Trade.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        trades: trades.map((trade) => ({
          id: trade._id,
          amount: trade.amount,
          profitPercentage: trade.profitPercentage,
          profitAmount: trade.profitAmount,
          startDate: trade.startDate,
          endDate: trade.endDate,
          status: trade.status,
          isBot: trade.isBot,
          botType: trade.botType,
          createdAt: trade.createdAt,
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get trades error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching trades",
    });
  }
};

// Get trade by ID
export const getTradeById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { tradeId } = req.params;

    // Find trade and check ownership
    const trade = await Trade.findOne({
      _id: tradeId,
      userId: user._id,
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found or not owned by user",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: trade._id,
        amount: trade.amount,
        profitPercentage: trade.profitPercentage,
        profitAmount: trade.profitAmount,
        startDate: trade.startDate,
        endDate: trade.endDate,
        status: trade.status,
        isBot: trade.isBot,
        botType: trade.botType,
        createdAt: trade.createdAt,
        updatedAt: trade.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get trade by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching trade",
    });
  }
};

// Get random graph data (dummy data for trading graph)
export const getGraphData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Generate random data points for the graph
    const dataPoints = [];
    const numPoints = 30; // Number of data points (e.g., for 30 days)

    let value = 5000 + Math.random() * 1000; // Start value

    for (let i = 0; i < numPoints; i++) {
      // Random price change between -2% and +2%
      const change = value * (Math.random() * 0.04 - 0.02);
      value += change;

      // Ensure value doesn't go below 0
      value = Math.max(value, 100);

      const date = new Date();
      date.setDate(date.getDate() - (numPoints - i));

      dataPoints.push({
        timestamp: date.toISOString(),
        value: parseFloat(value.toFixed(2)),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        dataPoints,
      },
    });
  } catch (error) {
    console.error("Get graph data error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating graph data",
    });
  }
};

// Complete a trade manually (for demo purposes)
export const completeTrade = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { tradeId } = req.params;
    const { profit, profitPercentage } = req.body;

    // Find the trade
    const trade = await Trade.findOne({
      _id: tradeId,
      userId: user._id,
      status: TradeStatus.ACTIVE,
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found or not active",
      });
    }

    // Update trade status and profit details
    trade.status = TradeStatus.COMPLETED;
    trade.profitAmount = profit;
    trade.profitPercentage = profitPercentage;
    trade.endDate = new Date(); // End date is now
    await trade.save();

    // Find the user and update balance and total profit
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add profit to user's balance and totalProfit
    userDoc.balance += trade.amount + profit; // Return the original amount plus profit
    userDoc.totalProfit += profit;
    await userDoc.save();

    return res.status(200).json({
      success: true,
      message: "Trade completed successfully",
      data: {
        id: trade._id,
        amount: trade.amount,
        profitPercentage: trade.profitPercentage,
        profitAmount: trade.profitAmount,
        startDate: trade.startDate,
        endDate: trade.endDate,
        status: trade.status,
        isBot: trade.isBot,
        botType: trade.botType,
        createdAt: trade.createdAt,
        updatedAt: trade.updatedAt,
      },
    });
  } catch (error) {
    console.error("Complete trade error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while completing trade",
    });
  }
};
