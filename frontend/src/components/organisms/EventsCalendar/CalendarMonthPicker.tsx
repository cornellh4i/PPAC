/**
 * Modal month/year picker with two scroll-snap columns (iOS-style wheel).
 *
 * On confirm, calls onConfirm with the 1st of the selected month/year.
 * EventsCalendar uses that to set displayMonth and jump weekStart to the
 * first Monday of that month.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { getYearRange, MONTH_NAMES } from "./calendarUtils";
import "./CalendarMonthPicker.scss";

interface CalendarMonthPickerProps {
  isOpen: boolean;
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

// Wheel layout: 5 visible rows; the middle row is the selection band.
// Top/bottom spacers (CENTER_OFFSET) let the first and last items scroll to center.
const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const YEAR_RADIUS = 5;
const CENTER_OFFSET = ((VISIBLE_ROWS - 1) / 2) * ITEM_HEIGHT;

/** Fades items further from the centered selection (visual depth for the wheel). */
const getItemOpacity = (distance: number): number => {
  if (distance === 0) return 1;
  if (distance === 1) return 0.55;
  return 0.3;
};

const VIEWPORT_CENTER = (VISIBLE_ROWS * ITEM_HEIGHT) / 2;

/** Maps a list index to the scrollTop that centers that item in the viewport. */
const getScrollTopForIndex = (index: number): number => index * ITEM_HEIGHT;

const getIndexFromScrollTop = (scrollTop: number, maxIndex: number): number => {
  const viewportCenter = scrollTop + VIEWPORT_CENTER;
  const index = Math.round(
    (viewportCenter - CENTER_OFFSET - ITEM_HEIGHT / 2) / ITEM_HEIGHT,
  );
  return Math.max(0, Math.min(maxIndex, index));
};

const PROGRAMMATIC_SCROLL_MS = 400;

const PickerSpacer = () => (
  <div
    className="calendar-picker__spacer"
    style={{ height: CENTER_OFFSET }}
    aria-hidden="true"
  />
);

/**
 * Modal dialog with two independently scrollable month/year columns.
 *
 * User interaction updates scroll position; the centered row is the selection.
 * On confirm, `onConfirm` receives `new Date(year, month, 1)` — the parent
 * (EventsCalendar) uses that to jump the week view to that month.
 */
const CalendarMonthPicker: React.FC<CalendarMonthPickerProps> = ({
  isOpen,
  initialDate,
  onConfirm,
  onClose,
}) => {
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const monthScrollTimeoutRef = useRef<number>();
  const yearScrollTimeoutRef = useRef<number>();
  // True while scrollToIndex is driving the column — prevents snap handlers from fighting it.
  const programmaticScrollRef = useRef(false);
  // True briefly after open while columns sync to initialDate — ignores stray scroll events.
  const syncOnOpenRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef<number>();

  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const years = useMemo(
    () => getYearRange(initialDate.getFullYear(), YEAR_RADIUS),
    [initialDate],
  );

  const selectedYearIndex = years.indexOf(selectedYear);

  /** Scroll a column so `index` is centered; sets programmaticScrollRef until scroll settles. */
  const scrollToIndex = useCallback(
    (column: HTMLDivElement | null, index: number, smooth = false) => {
      if (!column) return;

      window.clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollRef.current = true;

      column.scrollTo({
        top: getScrollTopForIndex(index),
        behavior: smooth ? "smooth" : "auto",
      });

      const clearProgrammaticScroll = () => {
        programmaticScrollRef.current = false;
      };

      const onScrollComplete = () => {
        clearProgrammaticScroll();
      };

      // scrollend is precise; timeout is a fallback for older browsers.
      if ("onscrollend" in column) {
        column.addEventListener("scrollend", onScrollComplete, { once: true });
      } else {
        programmaticScrollTimeoutRef.current = window.setTimeout(
          onScrollComplete,
          smooth ? PROGRAMMATIC_SCROLL_MS : 50,
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    const month = initialDate.getMonth();
    const year = initialDate.getFullYear();
    const yearIndex = years.indexOf(year);

    syncOnOpenRef.current = true;
    setSelectedMonth(month);
    setSelectedYear(year);

    const syncScroll = () => {
      scrollToIndex(monthRef.current, month);
      scrollToIndex(
        yearRef.current,
        yearIndex >= 0 ? yearIndex : YEAR_RADIUS,
      );
      window.setTimeout(() => {
        syncOnOpenRef.current = false;
      }, 50);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(syncScroll);
    });
  }, [isOpen, initialDate, years, scrollToIndex]);

  /** After free-scroll ends, snap the column so the nearest item locks to center. */
  const snapMonthColumn = useCallback(
    (column: HTMLDivElement) => {
      const index = getIndexFromScrollTop(
        column.scrollTop,
        MONTH_NAMES.length - 1,
      );
      const targetTop = getScrollTopForIndex(index);
      setSelectedMonth(index);
      if (Math.abs(column.scrollTop - targetTop) > 1) {
        scrollToIndex(column, index);
      }
    },
    [scrollToIndex],
  );

  const snapYearColumn = useCallback(
    (column: HTMLDivElement) => {
      const index = getIndexFromScrollTop(column.scrollTop, years.length - 1);
      const targetTop = getScrollTopForIndex(index);
      setSelectedYear(years[index]);
      if (Math.abs(column.scrollTop - targetTop) > 1) {
        scrollToIndex(column, index);
      }
    },
    [years, scrollToIndex],
  );

  // Live-update selection while scrolling
  const handleMonthScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const column = event.currentTarget;

      if (syncOnOpenRef.current || programmaticScrollRef.current) return;

      const index = getIndexFromScrollTop(
        column.scrollTop,
        MONTH_NAMES.length - 1,
      );
      setSelectedMonth(index);

      window.clearTimeout(monthScrollTimeoutRef.current);
      monthScrollTimeoutRef.current = window.setTimeout(() => {
        if (programmaticScrollRef.current) return;
        snapMonthColumn(column);
      }, 120);
    },
    [snapMonthColumn],
  );

  const handleYearScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const column = event.currentTarget;

      if (syncOnOpenRef.current || programmaticScrollRef.current) return;

      const index = getIndexFromScrollTop(column.scrollTop, years.length - 1);
      setSelectedYear(years[index]);

      window.clearTimeout(yearScrollTimeoutRef.current);
      yearScrollTimeoutRef.current = window.setTimeout(() => {
        if (programmaticScrollRef.current) return;
        snapYearColumn(column);
      }, 120);
    },
    [snapYearColumn, years],
  );

  const handleMonthClick = (index: number) => {
    setSelectedMonth(index);
    scrollToIndex(monthRef.current, index, true);
  };

  const handleYearClick = (index: number) => {
    setSelectedYear(years[index]);
    scrollToIndex(yearRef.current, index, true);
  };

  const handleMonthKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, selectedMonth - 1);
      setSelectedMonth(next);
      scrollToIndex(monthRef.current, next, true);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(MONTH_NAMES.length - 1, selectedMonth + 1);
      setSelectedMonth(next);
      scrollToIndex(monthRef.current, next, true);
    }
  };

  const handleYearKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const yearIndex = years.indexOf(selectedYear);
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, yearIndex - 1);
      setSelectedYear(years[next]);
      scrollToIndex(yearRef.current, next, true);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(years.length - 1, yearIndex + 1);
      setSelectedYear(years[next]);
      scrollToIndex(yearRef.current, next, true);
    }
  };

  if (!isOpen) return null;

  // Read scroll position at confirm time
  const handleConfirm = () => {
    const month = monthRef.current
      ? getIndexFromScrollTop(
          monthRef.current.scrollTop,
          MONTH_NAMES.length - 1,
        )
      : selectedMonth;
    const yearIndex = yearRef.current
      ? getIndexFromScrollTop(yearRef.current.scrollTop, years.length - 1)
      : years.indexOf(selectedYear);
    const year = years[yearIndex] ?? selectedYear;

    onConfirm(new Date(year, month, 1));
  };

  return (
    <div className="calendar-picker__overlay" onClick={onClose}>
      <div
        className="calendar-picker"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Select month and year"
      >
        <header className="calendar-picker__header">
          <button
            type="button"
            className="calendar-picker__icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
          <p className="calendar-picker__title">Select month-year</p>
          <button
            type="button"
            className="calendar-picker__icon-btn calendar-picker__icon-btn--confirm"
            onClick={handleConfirm}
            aria-label="Confirm"
          >
            <Check size={14} strokeWidth={2} />
          </button>
        </header>

        <div className="calendar-picker__body">
          <div className="calendar-picker__selection-band" aria-hidden="true" />

          <div
            ref={monthRef}
            className="calendar-picker__column calendar-picker__column--months"
            aria-label="Select month"
            tabIndex={0}
            onScroll={handleMonthScroll}
            onKeyDown={handleMonthKeyDown}
          >
            <PickerSpacer />
            {MONTH_NAMES.map((name, index) => {
              const distance = Math.abs(index - selectedMonth);
              const isSelected = index === selectedMonth;

              return (
                <button
                  key={name}
                  type="button"
                  className={`calendar-picker__item${
                    isSelected ? " calendar-picker__item--selected" : ""
                  }`}
                  style={{ opacity: getItemOpacity(distance) }}
                  aria-selected={isSelected}
                  onClick={() => handleMonthClick(index)}
                >
                  {name}
                </button>
              );
            })}
            <PickerSpacer />
          </div>

          <div
            ref={yearRef}
            className="calendar-picker__column calendar-picker__column--years"
            aria-label="Select year"
            tabIndex={0}
            onScroll={handleYearScroll}
            onKeyDown={handleYearKeyDown}
          >
            <PickerSpacer />
            {years.map((year, index) => {
              const distance = Math.abs(index - selectedYearIndex);
              const isSelected = year === selectedYear;

              return (
                <button
                  key={year}
                  type="button"
                  className={`calendar-picker__item${
                    isSelected ? " calendar-picker__item--selected" : ""
                  }`}
                  style={{ opacity: getItemOpacity(distance) }}
                  aria-selected={isSelected}
                  onClick={() => handleYearClick(index)}
                >
                  {year}
                </button>
              );
            })}
            <PickerSpacer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarMonthPicker;
