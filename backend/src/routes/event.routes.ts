import { Router } from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller";
import { authenticate, isVerified } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  createEventValidation,
  updateEventValidation,
} from "../utils/validations";
import { asyncHandler } from "../utils/express-utils";

const router = Router();

// Public routes
router.get("/", asyncHandler(getEvents));

// Admin routes (protected)
router.use(authenticate, isVerified);
router.post("/", validate(createEventValidation), asyncHandler(createEvent));
router.put(
  "/:eventId",
  validate(updateEventValidation),
  asyncHandler(updateEvent)
);
router.delete("/:eventId", asyncHandler(deleteEvent));

export default router;
