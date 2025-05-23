import mongoose, { Document, Schema } from "mongoose";

// Password Reset document interface
export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

// Password Reset schema
const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // The document will be automatically deleted after 1 hour (3600 seconds)
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create and export the Password Reset model
const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  PasswordResetSchema
);
export default PasswordReset;
