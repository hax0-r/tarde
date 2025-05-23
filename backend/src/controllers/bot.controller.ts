import { Request, Response } from "express";
import { IUser } from "../models/User";
import BotSubscription, {
  BotType,
  BotSubscriptionStatus,
} from "../models/BotSubscription";

// Get all bot plans
export const getBotPlans = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Define bot plans
    const botPlans = [
      {
        id: BotType.BASIC,
        name: "Basic Bot",
        profitPercentage: 12,
        duration: "1 Month",
        price: 5000, // PKR
        description: "Start with our basic bot and get 12% profit per trade",
      },
      {
        id: BotType.ADVANCED,
        name: "Advanced Bot",
        profitPercentage: 14,
        duration: "1 Month",
        price: 10000, // PKR
        description:
          "Get more profit with our advanced bot at 14% profit per trade",
      },
      {
        id: BotType.PRO,
        name: "Pro Bot",
        profitPercentage: 15,
        duration: "1 Month",
        price: 15000, // PKR
        description:
          "Maximize your profit with our pro bot at 15% profit per trade",
      },
    ];

    return res.status(200).json({
      success: true,
      data: botPlans,
    });
  } catch (error) {
    console.error("Get bot plans error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching bot plans",
    });
  }
};

// Request a bot subscription with payment proof
export const requestBotSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { planId, paymentProofUrl } = req.body;

    // Validate plan ID
    if (!Object.values(BotType).includes(planId as BotType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot plan selected",
      });
    }

    // Validate payment proof URL
    if (!paymentProofUrl) {
      return res.status(400).json({
        success: false,
        message: "Payment proof is required",
      });
    }

    // Get profit percentage based on bot type
    let profitPercentage = 0;
    let price = 0;

    switch (planId) {
      case BotType.BASIC:
        price = 5000;
        profitPercentage = 12;
        break;
      case BotType.ADVANCED:
        price = 10000;
        profitPercentage = 14;
        break;
      case BotType.PRO:
        price = 15000;
        profitPercentage = 15;
        break;
    }

    // Check if user already has a pending request for the same bot type
    const existingRequest = await BotSubscription.findOne({
      userId: user._id,
      botType: planId,
      status: BotSubscriptionStatus.PENDING,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this bot plan",
      });
    }

    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Create new bot subscription request
    const botSubscription = new BotSubscription({
      userId: user._id,
      botType: planId,
      profitPercentage,
      status: BotSubscriptionStatus.PENDING,
      isActive: false,
      startDate: new Date(),
      endDate,
      paymentProofUrl,
    });

    await botSubscription.save();

    return res.status(201).json({
      success: true,
      message:
        "Bot subscription request submitted successfully. It will be reviewed by our team.",
      data: {
        requestId: botSubscription._id,
      },
    });
  } catch (error) {
    console.error("Request bot subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while requesting bot subscription",
    });
  }
};

// Purchase a bot plan (from user balance)
export const purchaseBotPlan = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { planId } = req.body;

    // Validate plan ID
    if (!Object.values(BotType).includes(planId as BotType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot plan selected",
      });
    }

    // Get plan details
    let price = 0;
    let profitPercentage = 0;

    switch (planId) {
      case BotType.BASIC:
        price = 5000;
        profitPercentage = 12;
        break;
      case BotType.ADVANCED:
        price = 10000;
        profitPercentage = 14;
        break;
      case BotType.PRO:
        price = 15000;
        profitPercentage = 15;
        break;
    }

    // Check if user has sufficient balance
    if (user.balance < price) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance to purchase this bot plan",
      });
    }

    // Deactivate any existing bot subscriptions
    await BotSubscription.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );

    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Create new bot subscription
    const botSubscription = new BotSubscription({
      userId: user._id,
      botType: planId,
      profitPercentage,
      status: BotSubscriptionStatus.ACTIVE,
      isActive: true,
      startDate: new Date(),
      endDate,
    });

    await botSubscription.save();

    // Deduct plan price from user's balance
    user.balance -= price;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Bot plan purchased successfully",
      data: {
        id: botSubscription._id,
        botType: botSubscription.botType,
        profitPercentage: botSubscription.profitPercentage,
        startDate: botSubscription.startDate,
        endDate: botSubscription.endDate,
        isActive: botSubscription.isActive,
      },
    });
  } catch (error) {
    console.error("Purchase bot plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while purchasing bot plan",
    });
  }
};

// Approve or reject bot subscription (admin only)
export const approveRejectBotSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subscriptionId } = req.params;
    const { action, adminNote } = req.body;

    // Validate action
    if (action !== "approve" && action !== "reject") {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
      });
    }

    // Find the subscription
    const subscription = await BotSubscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Bot subscription request not found",
      });
    }

    // Check if the subscription is in pending status
    if (subscription.status !== BotSubscriptionStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Cannot ${action} subscription that is not in pending status`,
      });
    }

    if (action === "approve") {
      // Deactivate any existing bot subscriptions for the user
      await BotSubscription.updateMany(
        { userId: subscription.userId, isActive: true },
        { isActive: false }
      );

      // Approve the subscription
      subscription.status = BotSubscriptionStatus.ACTIVE;
      subscription.isActive = true;
      if (adminNote) subscription.adminNote = adminNote;
      await subscription.save();

      return res.status(200).json({
        success: true,
        message: "Bot subscription approved successfully",
      });
    } else {
      // Reject the subscription
      subscription.status = BotSubscriptionStatus.REJECTED;
      if (adminNote) subscription.adminNote = adminNote;
      await subscription.save();

      return res.status(200).json({
        success: true,
        message: "Bot subscription rejected successfully",
      });
    }
  } catch (error) {
    console.error("Approve/reject bot subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing bot subscription",
    });
  }
};

// Get all bot subscription requests (admin only)
export const getBotSubscriptionRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { status } = req.query;

    // Build filter based on query parameters
    const filter: any = {};

    if (
      status &&
      Object.values(BotSubscriptionStatus).includes(
        status as BotSubscriptionStatus
      )
    ) {
      filter.status = status;
    }

    // Find subscriptions with populated user data
    const subscriptions = await BotSubscription.find(filter)
      .populate("userId", "fullName email profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: subscriptions.map((subscription) => ({
        id: subscription._id,
        botType: subscription.botType,
        profitPercentage: subscription.profitPercentage,
        status: subscription.status,
        isActive: subscription.isActive,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        paymentProofUrl: subscription.paymentProofUrl,
        adminNote: subscription.adminNote,
        createdAt: subscription.createdAt,
        user: subscription.userId,
      })),
    });
  } catch (error) {
    console.error("Get bot subscription requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching bot subscription requests",
    });
  }
};

// Get user's active bot subscription
export const getActiveBotSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Find user's active bot subscription
    const botSubscription = await BotSubscription.findOne({
      userId: user._id,
      isActive: true,
      status: BotSubscriptionStatus.ACTIVE,
      endDate: { $gte: new Date() },
    });

    if (!botSubscription) {
      // Check if user has any pending subscription requests
      const pendingSubscription = await BotSubscription.findOne({
        userId: user._id,
        status: BotSubscriptionStatus.PENDING,
      });

      if (pendingSubscription) {
        return res.status(200).json({
          success: true,
          data: {
            isActive: false,
            isPending: true,
            botType: pendingSubscription.botType,
            requestedAt: pendingSubscription.createdAt,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: "No active bot subscription found",
        data: {
          isActive: false,
          isPending: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isActive: true,
        isPending: false,
        id: botSubscription._id,
        botType: botSubscription.botType,
        profitPercentage: botSubscription.profitPercentage,
        startDate: botSubscription.startDate,
        endDate: botSubscription.endDate,
        remainingDays: Math.ceil(
          (botSubscription.endDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
    });
  } catch (error) {
    console.error("Get active bot subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching active bot subscription",
    });
  }
};

// Cancel bot subscription
export const cancelBotSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Find user's active bot subscription
    const botSubscription = await BotSubscription.findOne({
      userId: user._id,
      isActive: true,
    });

    if (!botSubscription) {
      return res.status(404).json({
        success: false,
        message: "No active bot subscription found",
      });
    }

    // Deactivate subscription
    botSubscription.isActive = false;
    botSubscription.status = BotSubscriptionStatus.CANCELLED;
    await botSubscription.save();

    return res.status(200).json({
      success: true,
      message: "Bot subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel bot subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling bot subscription",
    });
  }
};
