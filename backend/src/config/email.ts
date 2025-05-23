import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email configuration
const emailConfig = {
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
};

// Create email transporter
export const transporter = nodemailer.createTransport(emailConfig);

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@wealthywaytrade.com",
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send OTP email
export const sendOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<boolean> => {
  const subject = "Your One-Time Password for Wealthy Way Trade";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with Wealthy Way Trade. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP is valid for 5 minutes only. Please do not share this OTP with anyone.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
      <p>Best regards,<br/>Wealthy Way Trade Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name: string
): Promise<boolean> => {
  const resetLink = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;
  const subject = "Password Reset - Wealthy Way Trade";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your Wealthy Way Trade account. Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
      </div>
      <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,<br/>Wealthy Way Trade Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};
