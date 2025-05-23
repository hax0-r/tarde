import mongoose, { Document, Schema } from "mongoose";

// Bot subscription types
export enum BotType {
  BASIC = "basic",
  ADVANCED = "advanced",
  PRO = "pro",
}

// Bot subscription status
export enum BotSubscriptionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

// Bot subscription document interface
export interface IBotSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  botType: BotType;
  profitPercentage: number;
  status: BotSubscriptionStatus;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  paymentProofUrl?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bot subscription schema
const BotSubscriptionSchema = new Schema<IBotSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    botType: {
      type: String,
      enum: Object.values(BotType),
      required: true,
    },
    profitPercentage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BotSubscriptionStatus),
      default: BotSubscriptionStatus.PENDING,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentProofUrl: {
      type: String,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get profit percentage by bot type
BotSubscriptionSchema.statics.getProfitPercentage = function (
  botType: BotType
): number {
  switch (botType) {
    case BotType.BASIC:
      return 12; // 12% profit for basic bot
    case BotType.ADVANCED:
      return 14; // 14% profit for advanced bot
    case BotType.PRO:
      return 15; // 15% profit for pro bot
    default:
      return 10; // Default profit (without bot)
  }
};

// Create and export the Bot Subscription model
const BotSubscription = mongoose.model<IBotSubscription>(
  "BotSubscription",
  BotSubscriptionSchema
);
export default BotSubscription;
