import mongoose, { Document, Schema } from "mongoose";

// Event document interface
export interface IEvent extends Document {
  title: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Event schema
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Event model
const Event = mongoose.model<IEvent>("Event", EventSchema);
export default Event;
