export const DAY_LABELS = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const HOUR_LABELS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export const GRID_START_HOUR = 10;
export const GRID_END_HOUR = 22;
export const GRID_BODY_HEIGHT = 638;
export const GRID_TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

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

export const getMinutesFromGridStart = (date: Date): number => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const gridStart = GRID_START_HOUR * 60;
  return Math.max(0, Math.min(GRID_TOTAL_MINUTES, minutes - gridStart));
};

export const minutesToPixels = (minutes: number): number =>
  (minutes / GRID_TOTAL_MINUTES) * GRID_BODY_HEIGHT;

export const getFirstMondayOfMonth = (year: number, month: number): Date =>
  getMonday(new Date(year, month, 1));

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

export const labelIndexTop = (index: number): number => {
  if (HOUR_LABELS.length <= 1) return 0;
  return (index / (HOUR_LABELS.length - 1)) * GRID_BODY_HEIGHT;
};

export const hourToGridTop = (hour: number): number => {
  const index = HOUR_LABELS.indexOf(hour);
  if (index === -1) return 0;
  return labelIndexTop(index);
};
