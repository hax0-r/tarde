import { useState, useEffect } from "react";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { PiCalendarDotsThin } from "react-icons/pi";
import eventService, { Event } from "../../../services/eventService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <UserDashboardLeftBar breadcrumb="Events">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white opacity-80">Loading events...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex items-center justify-center text-[#8b8891] flex-col mt-10">
          <PiCalendarDotsThin className="md:text-[10rem] text-8xl opacity-25" />
          <h3 className="md:text-lg text-center">
            There are currently no upcoming events, but check back soon!
          </h3>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Upcoming Events
          </h2>

          {events.map((event) => (
            <div
              key={event.id}
              className="bg-[#2a1c40] rounded-lg p-6 shadow-lg border border-[#6d45b9]/30"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-white">
                  {event.title}
                </h3>
                <span className="text-[#b689ff] text-sm">
                  {formatDate(event.createdAt)}
                </span>
              </div>
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                {event.description}
              </p>
              <div className="flex">
                <div className="text-xs px-3 py-1 rounded-full bg-[#6d45b9]/20 text-[#b689ff]">
                  Special Event
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserDashboardLeftBar>
  );
};

export default Events;
