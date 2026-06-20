import React, { useEffect, useMemo, useState } from "react";
import EventCard, {
  EventCardEvent,
} from "../../molecules/EventViewCard/EventCard";
import EventsCalendar from "../../organisms/EventsCalendar/EventsCalendar";
import "./index.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setEvents(json.data ?? []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
              <div className="events__list">
                {upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>

          <section className="events__section events__section--past">
            <div className="events__section-header">
              <h2 className="events__section-heading">Past events</h2>
              {pastEvents.length > 0 && (
                <button type="button" className="events__view-more">
                  View more
                </button>
              )}
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

        <EventsCalendar events={events} />
      </div>
    </div>
  );
};

export default Events;
