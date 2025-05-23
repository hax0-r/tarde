import mongoose, { Document, Schema } from "mongoose";

// OTP document interface
export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

// OTP schema
const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // The document will be automatically deleted after 5 minutes (300 seconds)
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create and export the OTP model
const OTP = mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP;
