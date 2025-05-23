import { Request, Response } from "express";
import { IUser } from "../models/User";
import PaymentMethod, { PaymentMethodType } from "../models/PaymentMethod";
import Transaction, {
  TransactionType,
  TransactionStatus,
} from "../models/Transaction";
import User from "../models/User";

// Create a deposit
export const createDeposit = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { amount, paymentMethodId, transactionReference } = req.body;

    // Validate amount
    if (!amount || amount < 5000 || amount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Deposit amount must be between 5,000 and 50,000 PKR",
      });
    }

    // Handle both PaymentMethod and direct manual deposits
    let paymentMethod;
    let paymentMethodType = PaymentMethodType.BANK; // Default to bank for manual deposits

    // Check if it's a manual deposit with screenshot (paymentMethodId === "manual")
    if (paymentMethodId === "manual") {
      if (!transactionReference) {
        return res.status(400).json({
          success: false,
          message: "Payment screenshot URL is required for manual deposits",
        });
      }
    } else {
      // Check if payment method exists and belongs to user
      paymentMethod = await PaymentMethod.findOne({
        _id: paymentMethodId,
        userId: user._id,
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: "Payment method not found or not owned by user",
        });
      }

      paymentMethodType = paymentMethod.type;

      // For mobile wallet payments (Easypaisa/JazzCash), require transaction reference
      if (
        (paymentMethodType === PaymentMethodType.EASYPAISA ||
          paymentMethodType === PaymentMethodType.JAZZCASH) &&
        !transactionReference
      ) {
        return res.status(400).json({
          success: false,
          message: `Transaction reference number is required for ${paymentMethodType} deposits`,
        });
      }
    }

    // Create deposit transaction
    const transaction = new Transaction({
      userId: user._id,
      amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      paymentMethodId: paymentMethod ? paymentMethod._id : null,
      paymentMethodType: paymentMethodType,
      transactionReference,
      description: `Deposit of ${amount} PKR via ${
        paymentMethod ? paymentMethod.type : "manual transfer"
      }`,
    });

    await transaction.save();

    return res.status(201).json({
      success: true,
      message: "Deposit request created successfully",
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: paymentMethod ? paymentMethod.type : "manual",
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating deposit",
    });
  }
};

// Create a withdrawal
export const createWithdrawal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { amount, paymentMethodId } = req.body;

    // Validate amount
    if (!amount || amount < 5000 || amount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal amount must be between 5,000 and 50,000 PKR",
      });
    }

    // Variables for transaction creation
    let paymentMethod = null;
    let paymentMethodType = PaymentMethodType.BANK; // Default for manual
    let description = `Withdrawal of ${amount} PKR`;

    // If manual withdrawal, no need to check for payment method
    if (paymentMethodId !== "manual") {
      // Check if payment method exists and belongs to user
      paymentMethod = await PaymentMethod.findOne({
        _id: paymentMethodId,
        userId: user._id,
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: "Payment method not found or not owned by user",
        });
      }

      paymentMethodType = paymentMethod.type;
      description = `Withdrawal of ${amount} PKR via ${paymentMethod.type}`;
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId: user._id,
      amount,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      paymentMethodId: paymentMethod ? paymentMethod._id : null,
      paymentMethodType,
      description,
    });

    await transaction.save();

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: paymentMethod ? paymentMethod.type : "manual",
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating withdrawal",
    });
  }
};

// Get all transactions
export const getTransactions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { type, status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter: any = {};

    // If non-admin user, only show their transactions
    if (!user.isAdmin) {
      filter.userId = user._id;
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("paymentMethodId", "type accountNumber accountTitle bankName")
      .populate("userId", "fullName email profileImage");

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        transactions: transactions.map((transaction) => {
          const paymentMethod = transaction.paymentMethodId as any;
          const userData = transaction.userId as any;
          let maskedAccountNumber = "";

          // Handle manual deposits that don't have a payment method
          if (!paymentMethod) {
            return {
              id: transaction._id,
              amount: transaction.amount,
              type: transaction.type,
              status: transaction.status,
              paymentMethod: {
                id: "manual",
                type: "manual",
                accountNumber: "N/A",
                accountTitle: "Manual Deposit",
                bankName: "N/A",
              },
              user: userData
                ? {
                    id: userData._id,
                    fullName: userData.fullName,
                    email: userData.email,
                    profileImage: userData.profileImage,
                  }
                : null,
              transactionReference: transaction.transactionReference,
              description: transaction.description,
              createdAt: transaction.createdAt,
            };
          }

          // Process transaction with payment method
          if (paymentMethod && paymentMethod.type === PaymentMethodType.BANK) {
            maskedAccountNumber = paymentMethod.accountNumber
              .slice(-4)
              .padStart(paymentMethod.accountNumber.length, "*");
          } else if (paymentMethod && paymentMethod.accountNumber) {
            // For mobile wallets, show first 4 digits only
            maskedAccountNumber =
              paymentMethod.accountNumber.slice(0, 4) + "******";
          }

          return {
            id: transaction._id,
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            paymentMethod: {
              id: paymentMethod._id,
              type: paymentMethod.type,
              accountNumber: maskedAccountNumber,
              accountTitle: paymentMethod.accountTitle,
              bankName: paymentMethod.bankName,
            },
            user: userData
              ? {
                  id: userData._id,
                  fullName: userData.fullName,
                  email: userData.email,
                  profileImage: userData.profileImage,
                }
              : null,
            transactionReference: transaction.transactionReference,
            description: transaction.description,
            createdAt: transaction.createdAt,
          };
        }),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching transactions",
    });
  }
};

// Get transaction by ID
export const getTransactionById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { transactionId } = req.params;

    // Find transaction and check ownership
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: user._id,
    }).populate("paymentMethodId", "type accountNumber accountTitle bankName");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or not owned by user",
      });
    }

    const paymentMethod = transaction.paymentMethodId as any;
    let maskedAccountNumber = "";

    // Handle manual deposits that don't have a payment method
    if (!paymentMethod) {
      return res.status(200).json({
        success: true,
        data: {
          id: transaction._id,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          paymentMethod: {
            id: "manual",
            type: "manual",
            accountNumber: "N/A",
            accountTitle: "Manual Deposit",
            bankName: "N/A",
          },
          transactionReference: transaction.transactionReference,
          description: transaction.description,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
      });
    }

    // Process transaction with payment method
    if (paymentMethod && paymentMethod.type === PaymentMethodType.BANK) {
      maskedAccountNumber = paymentMethod.accountNumber
        .slice(-4)
        .padStart(paymentMethod.accountNumber.length, "*");
    } else if (paymentMethod && paymentMethod.accountNumber) {
      // For mobile wallets, show first 4 digits only
      maskedAccountNumber = paymentMethod.accountNumber.slice(0, 4) + "******";
    }

    return res.status(200).json({
      success: true,
      data: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        paymentMethod: {
          id: paymentMethod._id,
          type: paymentMethod.type,
          accountNumber: maskedAccountNumber,
          accountTitle: paymentMethod.accountTitle,
          bankName: paymentMethod.bankName,
        },
        transactionReference: transaction.transactionReference,
        description: transaction.description,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get transaction by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching transaction",
    });
  }
};

// Update transaction status (admin only)
export const updateTransactionStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { transactionId } = req.params;
    const { status, adminNote } = req.body;

    // Validate that status is a valid TransactionStatus
    if (!Object.values(TransactionStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction status",
      });
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update the transaction status
    const previousStatus = transaction.status;
    transaction.status = status;

    // Add admin note if provided
    if (adminNote) {
      transaction.description += ` | Admin Note: ${adminNote}`;
    }

    await transaction.save();

    // If transaction was approved, update user's balance for deposits
    if (
      status === TransactionStatus.COMPLETED &&
      previousStatus !== TransactionStatus.COMPLETED &&
      transaction.type === TransactionType.DEPOSIT
    ) {
      // Credit user's account for deposits
      const user = await User.findById(transaction.userId);
      if (user) {
        user.balance += transaction.amount;
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${status}`,
      data: {
        transactionId: transaction._id,
        status: transaction.status,
        type: transaction.type,
        amount: transaction.amount,
      },
    });
  } catch (error) {
    console.error("Update transaction status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating transaction status",
    });
  }
};
