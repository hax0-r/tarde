import mongoose, { Document, Schema } from "mongoose";

// Trade status
export enum TradeStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
}

// Trade document interface
export interface ITrade extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  profitPercentage: number;
  profitAmount: number;
  startDate: Date;
  endDate: Date;
  status: TradeStatus;
  isBot: boolean;
  botType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Trade schema
const TradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      min: 5000, // Minimum trade amount: 5000 PKR
      max: 50000, // Maximum trade amount: 50000 PKR
    },
    profitPercentage: {
      type: Number,
      required: true,
      min: 10, // Minimum profit: 10%
      max: 15, // Maximum profit: 15%
    },
    profitAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TradeStatus),
      default: TradeStatus.ACTIVE,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    botType: {
      type: String,
      enum: ["basic", "advanced", "pro"],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Trade model
const Trade = mongoose.model<ITrade>("Trade", TradeSchema);
export default Trade;
