/**
 * Shared date/time helpers for EventsCalendar and CalendarMonthPicker.
 *
 * The time grid maps wall-clock minutes (8:00–22:00) to pixel positions in a
 * 638px-tall day column. Keep GRID_BODY_HEIGHT in sync with
 * `.events-calendar__day-body` in EventsCalendar.scss.
 */

/** Column headers; index 0 = Monday (matches getWeekDays order). */
export const DAY_LABELS = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Hour ticks shown in the left time column (inclusive start, exclusive end + 1 for labels). */
export const HOUR_LABELS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export const GRID_START_HOUR = 8;
export const GRID_END_HOUR = 22;
/** Must match `.events-calendar__day-body { height }` in EventsCalendar.scss */
export const GRID_BODY_HEIGHT = 638;
export const GRID_TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Returns the Monday 00:00:00 of the week containing `date` (week starts Monday). */
export const getMonday = (date: Date): Date => {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return monday;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Seven dates starting at `weekStart` (Monday). */
export const getWeekDays = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

export const formatMonthYear = (date: Date): string =>
  date.toLocaleString("en-US", { month: "long", year: "numeric" });

export const formatHourLabel = (hour: number): string => {
  if (hour === 12) return "12 pm";
  if (hour < 12) return `${hour} am`;
  if (hour === 22) return "10 pm";
  return `${hour - 12} pm`;
};

/**
 * Minutes elapsed since GRID_START_HOUR on the event's start day.
 * Clamped to [0, GRID_TOTAL_MINUTES] so events outside the visible window
 * stick to the top or bottom edge of the grid.
 */
export const getMinutesFromGridStart = (date: Date): number => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const gridStart = GRID_START_HOUR * 60;
  return Math.max(0, Math.min(GRID_TOTAL_MINUTES, minutes - gridStart));
};

/** Linear map from grid minutes to pixel offset within the day body. */
export const minutesToPixels = (minutes: number): number =>
  (minutes / GRID_TOTAL_MINUTES) * GRID_BODY_HEIGHT;

/** First Monday on or before the 1st of the given month — used when jumping via the month picker. */
export const getFirstMondayOfMonth = (year: number, month: number): Date =>
  getMonday(new Date(year, month, 1));

/** Inclusive year list for the picker, centered on `centerYear`. */
export const getYearRange = (centerYear: number, radius = 5): number[] =>
  Array.from({ length: radius * 2 + 1 }, (_, i) => centerYear - radius + i);

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Vertical position for an hour label, aligned to the grid's top edge for that hour. */
export const hourToGridTop = (hour: number): number => {
  const minutes = (hour - GRID_START_HOUR) * 60;
  return minutesToPixels(
    Math.max(0, Math.min(GRID_TOTAL_MINUTES, minutes)),
  );
};
