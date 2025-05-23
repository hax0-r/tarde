import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import User, { IUser } from "../models/User";
import { asyncHandler } from "../utils/express-utils";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to authenticate requests
export const authenticate = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in.",
        });
      }

      // Extract the token
      const token = authHeader.split(" ")[1];

      // Verify the token
      const { valid, expired, payload } = verifyToken(token);

      if (!valid) {
        return res.status(401).json({
          success: false,
          message: expired
            ? "Token has expired. Please log in again."
            : "Invalid token. Please log in again.",
        });
      }

      // Find the user
      const user = await User.findById(payload.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during authentication.",
      });
    }
  }
);

// Middleware to check if user is verified
export const isVerified = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Email verification required. Please verify your email to access this resource.",
      });
    }
    next();
  }
);

// Admin check middleware
export const isAdmin = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const user = req.user as IUser;

      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admin access required",
        });
      }

      next();
    } catch (error) {
      console.error("Admin check error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during authorization check",
      });
    }
  }
);
