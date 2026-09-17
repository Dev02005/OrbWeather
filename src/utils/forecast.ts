import type { TimeFormat, WeatherData } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * The short weekday for a date-only string ("2026-09-08").
 *
 * Passing such a string to `new Date()` parses it as UTC midnight, so `getDay()`
 * returns the previous day for every viewer west of UTC. Building the date from
 * its parts pins the intended calendar day in any timezone.
 */
export function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
}

/**
 * The hour label for an API timestamp, read straight off the city's wall clock.
 * Parsing it instead would re-interpret it in the browser's zone, which shifts
 * across a local DST boundary.
 */
export function formatHour(isoTime: string, timeFormat: TimeFormat): string {
  const hour = Number(isoTime.slice(11, 13));
  if (timeFormat === '24h') {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
  return `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`;
}

/**
 * Whether an hour falls between its own day's sunrise and sunset, so each hour
 * gets a sun or a moon rather than every hour inheriting the current one.
 * All values share the city's timezone and format, so they compare as strings.
 */
export function isDaylightAt(time: string, daily: WeatherData['daily']): boolean {
  const dayIndex = daily.time.indexOf(time.slice(0, 10));
  if (dayIndex === -1) return true;
  return time >= daily.sunrise[dayIndex] && time < daily.sunset[dayIndex];
}
