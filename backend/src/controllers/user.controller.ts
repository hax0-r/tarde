import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import BankAccount from "../models/BankAccount";
import Trade from "../models/Trade";
import Referral from "../models/Referral";

// Update the interface for Request to include Multer file property
interface MulterRequest extends Request {
  file: any; // Use a simpler typing approach
}

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { fullName } = req.body;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { fullName },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};

// Update profile image
export const updateProfileImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Get the file from the request (uploaded by Multer)
    const file = (req as MulterRequest).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // The file has already been uploaded to Cloudinary by Multer
    // We can get the URL from req.file.path
    const profileImageUrl = file.path;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Update profile image error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during profile image update",
    });
  }
};

// Get user dashboard data
export const getDashboard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Get user's bank accounts
    const bankAccounts = await BankAccount.find({ userId: user._id });

    // Get user's active trades
    const activeTrades = await Trade.find({
      userId: user._id,
      status: "active",
    });

    // Get user's completed trades
    const completedTrades = await Trade.find({
      userId: user._id,
      status: "completed",
    });

    // Get monthly performance data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPerformance = await Trade.aggregate([
      {
        $match: {
          userId: user._id,
          status: "completed",
          endDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$endDate" },
            year: { $year: "$endDate" },
          },
          totalProfit: { $sum: "$profitAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format monthly performance data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const performanceData = Array(6).fill({ month: "", profit: 0 });

    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date();
      targetDate.setMonth(currentDate.getMonth() - i);

      const month = targetDate.getMonth();
      const year = targetDate.getFullYear();

      const monthData = monthlyPerformance.find(
        (item) => item._id.month === month + 1 && item._id.year === year
      );

      performanceData[5 - i] = {
        month: months[month],
        profit: monthData ? monthData.totalProfit : 0,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage,
        },
        balance: user.balance,
        totalProfit: user.totalProfit,
        referralCount: user.referralCount,
        bankAccounts: bankAccounts.map((account) => ({
          id: account._id,
          bankName: account.bankName,
          accountNumber: account.accountNumber
            .slice(-4)
            .padStart(account.accountNumber.length, "*"),
          isDefault: account.isDefault,
        })),
        activeTrades: activeTrades.length,
        completedTrades: completedTrades.length,
        performance: performanceData,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

// Get referral data
export const getReferrals = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Get referrals
    const referrals = await Referral.find({ referrerId: user._id })
      .populate("referredUserId", "fullName email")
      .sort({ createdAt: -1 });

    // Calculate total reward amount
    const totalReward = referrals.reduce(
      (total, referral) => total + referral.rewardAmount,
      0
    );

    // Check if user has reached 25 referrals
    const eligibleForReward = referrals.length >= 25;

    return res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralCount: referrals.length,
        referralLink: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/register?ref=${user.referralCode}`,
        eligibleForReward,
        totalReward,
        referrals: referrals.map((referral) => ({
          id: referral._id,
          user: referral.referredUserId,
          tradeAmount: referral.totalTradeAmount,
          rewardAmount: referral.rewardAmount,
          isRewardClaimed: referral.isRewardClaimed,
          joinedAt: referral.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching referral data",
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Exclude admin users from the results
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// Delete a user (admin only)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deleting admin users
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin users cannot be deleted",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// Get user details by ID (admin only)
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's bank accounts
    const bankAccounts = await BankAccount.find({ userId: user._id });

    // Get user's referrals
    const referrals = await Referral.find({ referrerId: user._id })
      .populate("referredUserId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5); // Limit to most recent 5

    // Get user's transactions
    const transactions = await Trade.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to most recent 10

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: {
        ...user.toObject(),
        paymentMethods: bankAccounts.map((account) => ({
          id: account._id,
          type: account.bankName,
          name: `${account.bankName} - ${account.accountNumber
            .slice(-4)
            .padStart(account.accountNumber.length, "*")}`,
          isDefault: account.isDefault,
        })),
        referrals: referrals.map((referral) => ({
          id: referral._id,
          user: referral.referredUserId,
          joinedAt: referral.createdAt,
        })),
        transactions: transactions.map((transaction) => ({
          id: transaction._id,
          type: transaction.isBot ? "bot" : "manual",
          amount: transaction.amount,
          status: transaction.status,
          createdAt: transaction.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user details",
    });
  }
};
