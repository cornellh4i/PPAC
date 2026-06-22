/**
 * Week-view calendar: Monday–Sunday columns with an 8 am–10 pm time grid.
 *
 * Accepts the full event list from the parent; filters and plots events for the
 * visible week. Navigation: prev/next week buttons and a month/year picker that
 * jumps to the first Monday of the selected month.
 *
 * See README.md in this folder for architecture, state, and review notes.
 */
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCardEvent } from "../../molecules/EventViewCard/EventCard";
import CalendarMonthPicker from "./CalendarMonthPicker";
import {
  DAY_LABELS,
  GRID_TOTAL_MINUTES,
  HOUR_LABELS,
  addDays,
  formatHourLabel,
  formatMonthYear,
  getFirstMondayOfMonth,
  getMinutesFromGridStart,
  getMonday,
  getWeekDays,
  isSameDay,
  minutesToPixels,
  hourToGridTop,
} from "./calendarUtils";
import "./EventsCalendar.scss";

interface EventsCalendarProps {
  events: EventCardEvent[];
}

/** Layout-ready event: column index plus absolute positioning within the day body. */
interface PlottedEvent {
  event: EventCardEvent;
  /** 0 = Monday … 6 = Sunday (see getWeekDays) */
  dayIndex: number;
  /** px from top of `.events-calendar__day-body` */
  top: number;
  height: number;
  isAllDay: boolean;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events }) => {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date(today));
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [pickerOpen, setPickerOpen] = useState(false);


  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const referenceMonth = weekStart.getMonth();

  // Events whose startTime falls in [weekStart, weekStart + 7 days).
  const weekEvents = useMemo(() => {
    const weekEnd = addDays(weekStart, 7);
    return events.filter((event) => {
      const start = new Date(event.startTime);
      return start >= weekStart && start < weekEnd;
    });
  }, [events, weekStart]);

  // Convert filtered events to absolute top/height for each day column.
  const plottedEvents = useMemo((): PlottedEvent[] => {
    const result: PlottedEvent[] = [];

    weekEvents.forEach((event) => {
      const start = new Date(event.startTime);
      const dayIndex = weekDays.findIndex((day) => isSameDay(day, start));
      if (dayIndex === -1) return;

      if (event.allDay) {
        result.push({
          event,
          dayIndex,
          top: 0,
          height: 32,
          isAllDay: true,
        });
        return;
      }

      const top = minutesToPixels(getMinutesFromGridStart(start));
      // Default 1 h duration when endTime is null (matches EventCard).
      const end = event.endTime
        ? new Date(event.endTime)
        : new Date(start.getTime() + 60 * 60 * 1000);
      const durationMinutes = Math.max(
        (end.getTime() - start.getTime()) / 60000,
        0,
      );
      const height = Math.max(
        minutesToPixels(Math.min(durationMinutes, GRID_TOTAL_MINUTES)),
        16,
      );

      result.push({ event, dayIndex, top, height, isAllDay: false });
    });

    return result;
  }, [weekDays, weekEvents]);

  const handlePrevWeek = () => {
    setWeekStart((current) => {
      const next = addDays(current, -7);
      setDisplayMonth(new Date(next.getFullYear(), next.getMonth(), 1));
      return next;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((current) => {
      const next = addDays(current, 7);
      setDisplayMonth(new Date(next.getFullYear(), next.getMonth(), 1));
      return next;
    });
  };

  // Jump to the week containing the 1st of the chosen month (week anchor = that month's first Monday).
  const handlePickerConfirm = (date: Date) => {
    setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setWeekStart(getFirstMondayOfMonth(date.getFullYear(), date.getMonth()));
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setPickerOpen(false);
  };

  return (
    <section className="events-calendar">
      <header className="events-calendar__header">
        <h2 className="events-calendar__title">Calendar view</h2>

        <div className="events-calendar__nav">
          <button
            type="button"
            className="events-calendar__nav-btn"
            onClick={handlePrevWeek}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="events-calendar__nav-btn"
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="events-calendar__month-btn"
            onClick={() => setPickerOpen(true)}
          >
            <span>{formatMonthYear(displayMonth)}</span>
            <ChevronDown size={10} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="events-calendar__panel">
        <div className="events-calendar__grid-scroll">
          <div className="events-calendar__grid">
            <div className="events-calendar__time-col">
              <div className="events-calendar__time-header" aria-hidden="true" />
              <div className="events-calendar__time-labels">
                {HOUR_LABELS.map((hour) => (
                  <span
                    key={hour}
                    className="events-calendar__time-label"
                    style={{
                      top: `${hourToGridTop(hour)}px`,
                    }}
                  >
                    {formatHourLabel(hour)}
                  </span>
                ))}
              </div>
            </div>

            {weekDays.map((day, dayIndex) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const isAdjacentMonth = day.getMonth() !== referenceMonth;
              const dayEvents = plottedEvents.filter(
                (plotted) => plotted.dayIndex === dayIndex,
              );

              return (
                <div
                  key={day.toISOString()}
                  className={`events-calendar__day-col${
                    dayIndex === 6 ? " events-calendar__day-col--last" : ""
                  }`}
                >
                  <div className="events-calendar__day-header">
                    {DAY_LABELS[dayIndex]}
                  </div>

                  <div className="events-calendar__day-body">
                    <button
                      type="button"
                      className={`events-calendar__date-badge${
                        isSelected || isToday
                          ? " events-calendar__date-badge--selected"
                          : ""
                      }${isAdjacentMonth ? " events-calendar__date-badge--muted" : ""}`}
                      onClick={() => setSelectedDate(day)}
                      aria-label={`Select ${day.toLocaleDateString()}`}
                    >
                      {day.getDate()}
                    </button>

                    {dayEvents.map(({ event, top, height, isAllDay }) => (
                      <button
                        key={event._id}
                        type="button"
                        className={`events-calendar__event${
                          isAllDay ? " events-calendar__event--all-day" : ""
                        }`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        onClick={() => setSelectedDate(day)}
                        title={event.title}
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CalendarMonthPicker
        isOpen={pickerOpen}
        initialDate={displayMonth}
        onConfirm={handlePickerConfirm}
        onClose={() => setPickerOpen(false)}
      />
    </section>
  );
};

export default EventsCalendar;
