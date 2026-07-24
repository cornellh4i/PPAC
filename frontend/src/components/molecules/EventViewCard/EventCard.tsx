/**
 * Card for a single event on the Events page (upcoming/past lists).
 * Also exports EventCardEvent — the shared event shape used by EventsCalendar.
 */
import React from "react";
import "./EventCard.scss";
import { Calendar, MapPin } from "lucide-react";

/** Event payload from the API / mock data. Shared with EventsCalendar. */
export interface EventCardEvent {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string | null;
  allDay: boolean;
  imageUrl?: string | null;
  location: {
    type: string;
    venue: string;
    address: string;
    link: string | null;
  };
}

interface EventCardProps {
  event: EventCardEvent;
}

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

/**
 * Human-readable date for the card meta row.
 * All-day: "June 22nd, 2026".
 * Timed: "June 22nd, 2026, 3pm"
 */
const formatEventDate = (event: EventCardEvent): string => {
  const start = new Date(event.startTime);
  const month = start.toLocaleString("en-US", { month: "long" });
  const day = start.getDate();
  const year = start.getFullYear();

  if (event.allDay) {
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  }

  const hours = start.getHours();
  const minutes = start.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  const timeStr =
    minutes === 0
      ? `${hour12}${ampm}`
      : `${hour12}:${minutes.toString().padStart(2, "0")}${ampm}`;

  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}, ${timeStr}`;
};

/**
 * Google Calendar "create event" URL pre-filled from event fields.
 * Uses endTime when present; otherwise assumes a 1-hour duration (same as EventsCalendar).
 */
const buildCalendarUrl = (event: EventCardEvent): string => {
  const start = new Date(event.startTime);
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(start.getTime() + 60 * 60 * 1000);

  const toGoogleDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details: event.description,
    location: event.location.venue || event.location.address || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/** Display string for location; falls back to "TBA" when all fields are empty. */
const formatLocation = (event: EventCardEvent): string => {
  const { location } = event;
  if (location.venue) return location.venue;
  if (location.address) return location.address;
  if (location.link) return location.link;
  return "TBA";
};

/** Renders title, date, location, description, and an "Add to calendar" link. */
const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <article className="event-card">
      <div className="event-card__meta">
        <div className="event-card__details">
          <h2 className="event-card__title">{event.title}</h2>

          <p className="event-card__meta-row">
            <Calendar
              size={16}
              strokeWidth={1.5}
              className="event-card__icon"
              aria-hidden="true"
            />
            <span>{formatEventDate(event)}</span>
          </p>

          <p className="event-card__meta-row">
            <MapPin
              size={16}
              strokeWidth={1.5}
              className="event-card__icon"
              aria-hidden="true"
            />
            <span>{formatLocation(event)}</span>
          </p>
        </div>

        <a
          className="event-card__calendar-link"
          href={buildCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to calendar
        </a>
      </div>

      {event.description && (
        <p className="event-card__description">{event.description}</p>
      )}
    </article>
  );
};

export default EventCard;
