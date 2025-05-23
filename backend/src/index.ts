import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import routes from "./routes";
import { scheduleCronJobs } from "./utils/cron";
import { handleUploadErrors, globalErrorHandler } from "./middlewares/error";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDatabase()
  .then(() => {
    console.log("Connected to MongoDB");

    // Schedule cron jobs after DB connection is established
    scheduleCronJobs();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("dev")); // Request logging
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// API routes
app.use("/api", routes);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
  });
});

// 404 route handler
app.use("*path", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// File upload error handler (should be registered before global error handler)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleUploadErrors(err, req, res, next);
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res, next);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: Error) => {
  console.error("Unhandled Rejection:", reason);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

export default app;
