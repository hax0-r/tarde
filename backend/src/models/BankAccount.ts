import mongoose, { Document, Schema } from "mongoose";

// Bank Account document interface
export interface IBankAccount extends Document {
  userId: mongoose.Types.ObjectId;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Bank Account schema
const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Bank Account model
const BankAccount = mongoose.model<IBankAccount>(
  "BankAccount",
  BankAccountSchema
);
export default BankAccount;
