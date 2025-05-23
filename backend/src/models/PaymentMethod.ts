import mongoose, { Document, Schema } from "mongoose";

// Payment Method types
export enum PaymentMethodType {
  BANK = "bank",
  EASYPAISA = "easypaisa",
  JAZZCASH = "jazzcash",
}

// Payment Method document interface
export interface IPaymentMethod extends Document {
  userId: mongoose.Types.ObjectId;
  type: PaymentMethodType;
  accountNumber: string; // Bank account number, Easypaisa or JazzCash mobile number
  accountTitle: string; // Account holder name
  bankName?: string; // Only required for bank accounts
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Method schema
const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: Object.values(PaymentMethodType),
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountTitle: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: function (this: IPaymentMethod) {
        return this.type === PaymentMethodType.BANK;
      },
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

// Create and export the Payment Method model
const PaymentMethod = mongoose.model<IPaymentMethod>(
  "PaymentMethod",
  PaymentMethodSchema
);
export default PaymentMethod;
