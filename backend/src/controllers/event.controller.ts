import { Request, Response } from "express";
import Event from "../models/Event";

// Get all active events
export const getEvents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Get all active events
    const events = await Event.find({ isActive: true }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: events.map((event) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get events error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

// Admin: Create a new event
export const createEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { title, description } = req.body;

    // Validate request body
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Create new event
    const event = new Event({
      title,
      description,
      isActive: true,
    });

    await event.save();

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        id: event._id,
        title: event.title,
        description: event.description,
        isActive: event.isActive,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  }
};

// Admin: Update an event
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { eventId } = req.params;
    const { title, description, isActive } = req.body;

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Update event fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (isActive !== undefined) event.isActive = isActive;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: {
        id: event._id,
        title: event.title,
        description: event.description,
        isActive: event.isActive,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating event",
    });
  }
};

// Admin: Delete an event
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { eventId } = req.params;

    // Find and delete event
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting event",
    });
  }
};
