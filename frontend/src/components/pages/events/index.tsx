/**
 * Events page: fetches all events from the API, splits them into upcoming/past
 * lists, and renders the week calendar alongside.
 */
import React, { useEffect, useMemo, useState } from "react";
import EventCard, {
  EventCardEvent,
} from "../../molecules/EventViewCard/EventCard";
import EventsCalendar from "../../organisms/EventsCalendar/EventsCalendar";
import "./index.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/** Events page — list panels on the left, EventsCalendar on the right. */
const Events: React.FC = () => {
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load once on mount; expects { data: EventCardEvent[] } from GET /api/events.
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setEvents((json.data ?? []) as EventCardEvent[]);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Split by start of today (local midnight). Past list is newest-first.
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const upcoming = sorted.filter(
      (e) => new Date(e.startTime) >= startOfToday,
    );
    const past = sorted
      .filter((e) => new Date(e.startTime) < startOfToday)
      .reverse();

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  if (loading) {
    return <div className="events events--loading">Loading events...</div>;
  }

  if (error) {
    return <div className="events events--error">{error}</div>;
  }

  return (
    <div className="events">
      <div className="events__body">
        <div className="events__panel">
          <section className="events__section events__section--upcoming">
            <h2 className="events__section-heading">Upcoming events</h2>
            {upcomingEvents.length === 0 ? (
              <p className="events__empty">
                Nothing upcoming yet! Stay tuned!
              </p>
            ) : (
              <div className="events__list events__list--scroll">
                {upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>

          <section className="events__section events__section--past">
            <div className="events__section-header">
              <h2 className="events__section-heading">Past events</h2>
            </div>
            {pastEvents.length === 0 ? (
              <p className="events__empty">No past events.</p>
            ) : (
              <div className="events__list events__list--scroll">
                {pastEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: receives full list; filters to visible week internally */}
        <EventsCalendar events={events} />
      </div>
    </div>
  );
};

export default Events;
