import { Request, Response, NextFunction } from "express";
import multer from "multer";

// Extending MulterError type to include code property
interface MulterError extends Error {
  code: string;
  field?: string;
}

/**
 * Error middleware to handle file upload errors
 */
export const handleUploadErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    const multerError = err as MulterError;

    // A Multer error occurred during file upload
    if (multerError.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the maximum limit (5MB)",
      });
    }

    if (multerError.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field name for file upload",
      });
    }

    // Handle other Multer errors
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // For non-Multer errors, pass to the next error handler
  next(err);
};

/**
 * General error handler for API requests
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
