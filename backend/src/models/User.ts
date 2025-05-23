import mongoose, { Document, Schema } from "mongoose";
import * as bcrypt from "bcrypt";

// User document interface
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isVerified: boolean;
  isAdmin: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  balance: number;
  totalProfit: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralCount: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isNew: boolean;
  isModified(path: string): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    return next(error);
  }
});

// Generate unique referral code before saving a new user
userSchema.pre("save", function (next) {
  // Only generate referral code if it's a new user
  if (this.isNew) {
    // Generate a random alphanumeric code
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.referralCode = `${this.fullName
      .substring(0, 3)
      .toUpperCase()}${randomString}`;
  }

  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
