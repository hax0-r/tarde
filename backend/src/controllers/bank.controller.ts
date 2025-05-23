import { Request, Response } from "express";
import BankAccount from "../models/BankAccount";
import { IUser } from "../models/User";

// Add a new bank account
export const addBankAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { bankName, accountNumber, accountHolder } = req.body;

    // Validate request body
    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({
        success: false,
        message: "Bank name, account number, and account holder are required",
      });
    }

    // Check if account already exists
    const existingAccount = await BankAccount.findOne({
      userId: user._id,
      accountNumber,
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "This bank account is already added to your profile",
      });
    }

    // Get count of user's bank accounts
    const accountCount = await BankAccount.countDocuments({ userId: user._id });

    // If this is the first account, make it default
    const isDefault = accountCount === 0;

    // Create new bank account
    const bankAccount = new BankAccount({
      userId: user._id,
      bankName,
      accountNumber,
      accountHolder,
      isDefault,
    });

    await bankAccount.save();

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: {
        id: bankAccount._id,
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber
          .slice(-4)
          .padStart(bankAccount.accountNumber.length, "*"),
        accountHolder: bankAccount.accountHolder,
        isDefault: bankAccount.isDefault,
      },
    });
  } catch (error) {
    console.error("Add bank account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding bank account",
    });
  }
};

// Get all bank accounts
export const getBankAccounts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    // Find all bank accounts for the user
    const bankAccounts = await BankAccount.find({ userId: user._id });

    return res.status(200).json({
      success: true,
      data: bankAccounts.map((account) => ({
        id: account._id,
        bankName: account.bankName,
        accountNumber: account.accountNumber
          .slice(-4)
          .padStart(account.accountNumber.length, "*"),
        accountHolder: account.accountHolder,
        isDefault: account.isDefault,
      })),
    });
  } catch (error) {
    console.error("Get bank accounts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching bank accounts",
    });
  }
};

// Update bank account
export const updateBankAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { accountId } = req.params;
    const { bankName, accountHolder } = req.body;

    // Find bank account and check ownership
    const bankAccount = await BankAccount.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found or not owned by user",
      });
    }

    // Update fields
    if (bankName) bankAccount.bankName = bankName;
    if (accountHolder) bankAccount.accountHolder = accountHolder;

    await bankAccount.save();

    return res.status(200).json({
      success: true,
      message: "Bank account updated successfully",
      data: {
        id: bankAccount._id,
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber
          .slice(-4)
          .padStart(bankAccount.accountNumber.length, "*"),
        accountHolder: bankAccount.accountHolder,
        isDefault: bankAccount.isDefault,
      },
    });
  } catch (error) {
    console.error("Update bank account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating bank account",
    });
  }
};

// Set default bank account
export const setDefaultBankAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { accountId } = req.params;

    // Find bank account and check ownership
    const bankAccount = await BankAccount.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found or not owned by user",
      });
    }

    // Remove default status from all other accounts
    await BankAccount.updateMany({ userId: user._id }, { isDefault: false });

    // Set this account as default
    bankAccount.isDefault = true;
    await bankAccount.save();

    return res.status(200).json({
      success: true,
      message: "Default bank account updated successfully",
    });
  } catch (error) {
    console.error("Set default bank account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while setting default bank account",
    });
  }
};

// Delete bank account
export const deleteBankAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;
    const { accountId } = req.params;

    // Find bank account and check ownership
    const bankAccount = await BankAccount.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found or not owned by user",
      });
    }

    // Store if this was the default account
    const wasDefault = bankAccount.isDefault;

    // Delete account
    await BankAccount.deleteOne({ _id: accountId });

    // If this was the default account, set a new default
    if (wasDefault) {
      const anyAccount = await BankAccount.findOne({ userId: user._id });
      if (anyAccount) {
        anyAccount.isDefault = true;
        await anyAccount.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Delete bank account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting bank account",
    });
  }
};
