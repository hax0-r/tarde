import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { asyncHandler } from "../utils/express-utils";

// Middleware to validate request data
export const validate = (validations: ValidationChain[]) => {
  return asyncHandler(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void | Response> => {
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      next();
    }
  );
};
