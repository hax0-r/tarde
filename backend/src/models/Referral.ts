import mongoose, { Document, Schema } from "mongoose";

// Referral document interface
export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  totalTradeAmount: number;
  rewardAmount: number;
  isRewardClaimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Referral schema
const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    totalTradeAmount: {
      type: Number,
      default: 0,
    },
    rewardAmount: {
      type: Number,
      default: 0,
    },
    isRewardClaimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Referral model
const Referral = mongoose.model<IReferral>("Referral", ReferralSchema);
export default Referral;
