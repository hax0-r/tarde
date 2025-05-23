import { Request, Response, NextFunction, RequestHandler } from "express";

// Type for route handler that might return a Response object
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

// Convert an async handler that might return Response to an Express-compatible RequestHandler
export const asyncHandler = (fn: AsyncRouteHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
