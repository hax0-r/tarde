import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../Components/ui/button";
import { BiArrowBack } from "react-icons/bi";
import { GoGift } from "react-icons/go";
import { FaEdit, FaTrash } from "react-icons/fa";
import eventService, { Event } from "../../../services/eventService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const EventsManage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents();

      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        toast.error(response.message || "Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("An error occurred while loading events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setDeletingId(eventId);
      const response = await eventService.deleteEvent(eventId);

      if (response.success) {
        toast.success("Event deleted successfully");
        setEvents(events.filter((event) => event.id !== eventId));
      } else {
        toast.error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("An error occurred while deleting the event");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy • h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="bg-[#171022] w-full min-h-screen p-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-white mb-3 opacity-80 cursor-pointer"
      >
        <BiArrowBack /> Back
      </button>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl text-[#ffffffe5]">Manage Events</h3>
        <Button
          onClick={() => navigate("/event-add")}
          size="sm"
          className="flex items-center gap-2"
        >
          <GoGift className="text-white" /> Add New Event
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white opacity-80">Loading events...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#2a1c40] rounded-lg p-8 text-center">
          <GoGift className="text-[10rem] mx-auto opacity-25 text-[#b689ff]" />
          <h3 className="text-xl text-white mt-4 mb-2">
            No Events Created Yet
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first event to share with your users
          </p>
          <Button onClick={() => navigate("/event-add")} className="mx-auto">
            <GoGift className="mr-2" /> Create Event
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-[#2a1c40] rounded-lg p-6 shadow-lg border border-[#6d45b9]/30"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-white">
                  {event.title}
                </h3>
                <div className="flex items-center space-x-3">
                  <FaEdit
                    className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                    onClick={() => navigate(`/event-edit/${event.id}`)}
                  />
                  <FaTrash
                    className={`text-red-400 cursor-pointer hover:text-red-300 transition ${
                      deletingId === event.id ? "opacity-50" : ""
                    }`}
                    onClick={() =>
                      deletingId !== event.id && handleDelete(event.id)
                    }
                  />
                </div>
              </div>
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                {event.description}
              </p>
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs px-3 py-1 rounded-full bg-[#6d45b9]/20 text-[#b689ff]">
                  Active
                </div>
                <div className="text-[#b689ff] text-sm">
                  Created: {formatDate(event.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsManage;
