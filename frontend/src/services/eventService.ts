import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

export interface Event {
  id: string;
  title: string;
  description: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  isActive?: boolean;
}

const eventService = {
  // Get all events
  getEvents: async (): Promise<ApiResponse<Event[]>> => {
    const response = await apiClient.get<ApiResponse<Event[]>>("/events");
    return response.data;
  },

  // Create a new event (admin only)
  createEvent: async (data: CreateEventData): Promise<ApiResponse<Event>> => {
    const response = await apiClient.post<ApiResponse<Event>>("/events", data);
    return response.data;
  },

  // Update an event (admin only)
  updateEvent: async (
    eventId: string,
    data: UpdateEventData
  ): Promise<ApiResponse<Event>> => {
    const response = await apiClient.put<ApiResponse<Event>>(
      `/events/${eventId}`,
      data
    );
    return response.data;
  },

  // Delete an event (admin only)
  deleteEvent: async (eventId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/events/${eventId}`);
    return response.data;
  },
};

export default eventService;
