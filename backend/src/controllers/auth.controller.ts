import { Request, Response } from "express";
import { generateOTP, generateToken } from "../utils/token";
import { sendOTPEmail } from "../config/email";
import User, { IUser } from "../models/User";
import OTP from "../models/OTP";
import crypto from "crypto";
import Referral from "../models/Referral";

// Register a new user
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { fullName, email, password, confirmPassword, referralCode } =
      req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Find referrer if referral code is provided
    let referrerId = undefined;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrerId = referrer._id;

        // Log the referral
        console.log(
          `New user ${email} referred by user with ID ${referrer._id} (code: ${referralCode})`
        );
      } else {
        console.log(`Invalid referral code provided: ${referralCode}`);
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP valid for 5 minutes

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      expiresAt: otpExpiry,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, fullName);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    // Create user with isVerified = false
    const user = new User({
      fullName,
      email,
      password,
      isVerified: false,
      referredBy: referrerId,
    });

    await user.save();

    // If there's a valid referrer, increment their referral count
    if (referrerId) {
      await User.findByIdAndUpdate(referrerId, { $inc: { referralCount: 1 } });
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email with the OTP sent.",
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Verify OTP
export const verifyOTP = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, otp } = req.body;

    // Find the latest OTP for this email
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email",
      });
    }

    // Check if OTP is expired
    const now = new Date();
    if (now > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update user to verified
    const user = (await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    )) as IUser;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user was referred by someone, create a referral record
    if (user.referredBy) {
      try {
        console.log(
          `Creating referral record for user ${user._id} referred by ${user.referredBy}`
        );

        // Check if a referral record already exists
        const existingReferral = await Referral.findOne({
          referrerId: user.referredBy,
          referredUserId: user._id,
        });

        if (!existingReferral) {
          // Create a new referral record
          await Referral.create({
            referrerId: user.referredBy,
            referredUserId: user._id,
            totalTradeAmount: 0,
            rewardAmount: 0,
            isRewardClaimed: false,
          });

          console.log(`Referral record created successfully`);
        } else {
          console.log(`Referral record already exists`);
        }
      } catch (referralError) {
        console.error("Error creating referral record:", referralError);
        // Continue with the verification process even if creating the referral fails
      }
    }

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate auth token
    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = (await User.findOne({ email })) as IUser;
    console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate auth token
    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Request password reset (forgot password)
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = (await User.findOne({ email })) as IUser;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry (3 minutes)
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 3);

    // Save token to user document
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    // Create reset URL
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const resetURL = `${clientURL}/reset-password?token=${resetToken}&email=${email}`;

    // Send reset link email
    // TODO: Replace this with your actual email sending function
    try {
      // Example: await sendPasswordResetEmail(email, resetURL, user.fullName);

      // For now, we'll use the existing OTP email function with a modification
      const emailSent = await sendOTPEmail(
        email,
        `Click the link to reset your password: ${resetURL}`,
        user.fullName
      );

      if (!emailSent) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(500).json({
          success: false,
          message: "Failed to send password reset email. Please try again.",
        });
      }
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

// Verify reset token and reset password
export const verifyResetToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token, email } = req.body;

    // Find user by email
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
    }

    // Hash token and compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (user.resetPasswordToken !== tokenHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid.",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during token verification",
    });
  }
};

// Reset password with token
export const resetPasswordWithToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find user by email and valid reset token
    const user = (await User.findOne({
      email,
      resetPasswordExpires: { $gt: new Date() },
    })) as IUser;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
    }

    // Hash token and compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (user.resetPasswordToken !== tokenHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token.",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// Get current user profile
export const getProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser;

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        balance: user.balance,
        totalProfit: user.totalProfit,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
    });
  }
};
