import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller";
import { authenticate, isVerified } from "../middlewares/auth";
import { generalUpload } from "../utils/upload";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// All routes require authentication
router.use(authenticate, isVerified);

// Upload file route
router.post("/", generalUpload.single("file"), asyncHandler(uploadFile));

export default router;
