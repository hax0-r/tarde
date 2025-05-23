import jwt, { Secret, JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Ensure we have proper typing for the JWT secret
const JWT_SECRET: Secret = process.env.JWT_SECRET || "JWT_SECRET";
// JWT expiration time needs to be a string or number for the SignOptions
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d";

// Generate JWT token
export const generateToken = (userId: string): string => {
  const payload = { id: userId };
  const options: SignOptions = { expiresIn: "7d" };
  return jwt.sign(payload, JWT_SECRET, options);
};

// Verify JWT token
export interface TokenVerificationResult {
  valid: boolean;
  expired: boolean;
  payload: JwtPayload | null;
}

export const verifyToken = (token: string): TokenVerificationResult => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return { valid: true, expired: false, payload: decoded };
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === "jwt expired",
      payload: null,
    };
  }
};

// Generate a random OTP (6 digits)
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random reset token
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash a string (for storing reset tokens)
export const hashString = (string: string): string => {
  return crypto.createHash("sha256").update(string).digest("hex");
};
