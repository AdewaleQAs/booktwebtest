/**
 * Date helper utilities for event creation tests.
 * Computes future dates that are safe to select in the react-day-picker calendar.
 */

export interface FutureDate {
  day: number;
  monthName: string;
  year: number;
  /** Format: "February 2026" — matches the calendar header */
  monthYear: string;
}

/**
 * Get a future date relative to today.
 * @param daysFromNow Number of days from today (default: 14)
 */
export function getFutureDate(daysFromNow: number = 14): FutureDate {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  const day = date.getDate();
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  return {
    day,
    monthName,
    year,
    monthYear: `${monthName} ${year}`,
  };
}

/**
 * Get an end date that is after the start date.
 * @param startDaysFromNow Days from now for the start date
 * @param durationDays How many days after start for the end (default: 1)
 */
export function getEndDate(
  startDaysFromNow: number = 14,
  durationDays: number = 1
): FutureDate {
  return getFutureDate(startDaysFromNow + durationDays);
}
