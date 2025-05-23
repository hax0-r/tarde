import mongoose, { Document, Schema } from "mongoose";
import { PaymentMethodType } from "./PaymentMethod";

// Transaction types
export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
}

// Transaction status
export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Transaction document interface
export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethodId: mongoose.Types.ObjectId;
  paymentMethodType: PaymentMethodType;
  transactionReference?: string; // Reference number provided by payment processor
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction schema
const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      min: 5000, // Minimum amount: 5000 PKR
      max: 50000, // Maximum amount: 50000 PKR
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      // Make it optional for manual uploads where reference is the screenshot URL
      required: false,
    },
    paymentMethodType: {
      type: String,
      enum: Object.values(PaymentMethodType),
      required: true,
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Transaction model
const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
export default Transaction;
