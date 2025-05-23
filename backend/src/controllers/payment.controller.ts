import { Request, Response } from "express";
import { IUser } from "../models/User";
import PaymentMethod, { PaymentMethodType } from "../models/PaymentMethod";

// Add a payment method (Bank, Easypaisa, or JazzCash)
export const addPaymentMethod = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { type, accountNumber, accountTitle, bankName } = req.body;

    // Validate type
    if (!Object.values(PaymentMethodType).includes(type as PaymentMethodType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method type",
      });
    }

    // Validate account number format
    if (
      type === PaymentMethodType.EASYPAISA ||
      type === PaymentMethodType.JAZZCASH
    ) {
      // Pakistani mobile number format validation (simplified)
      const mobileRegex = /^(03\d{9})$/;
      if (!mobileRegex.test(accountNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mobile number format. Use format: 03XXXXXXXXX",
        });
      }
    }

    // If it's a bank account, bankName is required
    if (type === PaymentMethodType.BANK && !bankName) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required for bank accounts",
      });
    }

    // Check if this is the first payment method for this user
    const existingMethods = await PaymentMethod.countDocuments({
      userId: user._id,
    });
    const isDefault = existingMethods === 0;

    // Create payment method
    const paymentMethod = new PaymentMethod({
      userId: user._id,
      type,
      accountNumber,
      accountTitle,
      bankName,
      isDefault,
    });

    await paymentMethod.save();

    return res.status(201).json({
      success: true,
      message: "Payment method added successfully",
      data: {
        id: paymentMethod._id,
        type: paymentMethod.type,
        accountNumber:
          paymentMethod.type === PaymentMethodType.BANK
            ? paymentMethod.accountNumber
                .slice(-4)
                .padStart(paymentMethod.accountNumber.length, "*")
            : paymentMethod.accountNumber.slice(0, 4) + "******",
        accountTitle: paymentMethod.accountTitle,
        bankName: paymentMethod.bankName,
        isDefault: paymentMethod.isDefault,
      },
    });
  } catch (error) {
    console.error("Add payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding payment method",
    });
  }
};

// Get all payment methods
export const getPaymentMethods = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Get all payment methods for the user
    const paymentMethods = await PaymentMethod.find({ userId: user._id });

    return res.status(200).json({
      success: true,
      data: paymentMethods.map((method) => ({
        id: method._id,
        type: method.type,
        accountNumber:
          method.type === PaymentMethodType.BANK
            ? method.accountNumber
                .slice(-4)
                .padStart(method.accountNumber.length, "*")
            : method.accountNumber.slice(0, 4) + "******",
        accountTitle: method.accountTitle,
        bankName: method.bankName,
        isDefault: method.isDefault,
      })),
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment methods",
    });
  }
};

// Update payment method
export const updatePaymentMethod = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { methodId } = req.params;
    const { accountTitle, bankName } = req.body;

    // Find payment method and check ownership
    const paymentMethod = await PaymentMethod.findOne({
      _id: methodId,
      userId: user._id,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found or not owned by user",
      });
    }

    // Update fields
    if (accountTitle) paymentMethod.accountTitle = accountTitle;
    if (bankName && paymentMethod.type === PaymentMethodType.BANK) {
      paymentMethod.bankName = bankName;
    }

    await paymentMethod.save();

    return res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: {
        id: paymentMethod._id,
        type: paymentMethod.type,
        accountNumber:
          paymentMethod.type === PaymentMethodType.BANK
            ? paymentMethod.accountNumber
                .slice(-4)
                .padStart(paymentMethod.accountNumber.length, "*")
            : paymentMethod.accountNumber.slice(0, 4) + "******",
        accountTitle: paymentMethod.accountTitle,
        bankName: paymentMethod.bankName,
        isDefault: paymentMethod.isDefault,
      },
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating payment method",
    });
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { methodId } = req.params;

    // Find payment method and check ownership
    const paymentMethod = await PaymentMethod.findOne({
      _id: methodId,
      userId: user._id,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found or not owned by user",
      });
    }

    // Remove default status from all other payment methods
    await PaymentMethod.updateMany({ userId: user._id }, { isDefault: false });

    // Set this payment method as default
    paymentMethod.isDefault = true;
    await paymentMethod.save();

    return res.status(200).json({
      success: true,
      message: "Default payment method updated successfully",
    });
  } catch (error) {
    console.error("Set default payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while setting default payment method",
    });
  }
};

// Delete payment method
export const deletePaymentMethod = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { methodId } = req.params;

    // Find payment method and check ownership
    const paymentMethod = await PaymentMethod.findOne({
      _id: methodId,
      userId: user._id,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found or not owned by user",
      });
    }

    // Check if this is the default payment method
    if (paymentMethod.isDefault) {
      // Find another payment method to set as default
      const anotherMethod = await PaymentMethod.findOne({
        userId: user._id,
        _id: { $ne: methodId },
      });

      if (anotherMethod) {
        anotherMethod.isDefault = true;
        await anotherMethod.save();
      }
    }

    // Delete the payment method
    await PaymentMethod.deleteOne({ _id: paymentMethod._id });

    return res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting payment method",
    });
  }
};

// Get payment methods for a specific user (admin only)
export const getUserPaymentMethods = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const admin = req.user as IUser;

    // Check if admin
    if (!admin.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { userId } = req.params;

    // Get all payment methods for the specified user
    const paymentMethods = await PaymentMethod.find({ userId });

    return res.status(200).json({
      success: true,
      data: paymentMethods.map((method) => ({
        _id: method._id,
        userId: method.userId,
        type: method.type,
        accountNumber: method.accountNumber, // Return full account number for admin
        accountTitle: method.accountTitle,
        bankName: method.bankName,
        isDefault: method.isDefault,
        createdAt: method.createdAt,
        updatedAt: method.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get user payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user payment methods",
    });
  }
};
