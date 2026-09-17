import type { TimeFormat } from '../types';

// Open-Meteo is queried with `timezone: 'auto'`, so every timestamp it returns
// ("2026-09-07T23:00") is the city's own wall clock and carries no offset.
// Handing one to `new Date()` reads it in the *browser's* zone instead, which
// silently skews every comparison for a city the viewer isn't sitting in.
// Compare against the city's clock with the helpers below.

/** The city's current wall clock, in the same naive format the API returns. */
export function cityNow(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  // Some engines report midnight as hour 24 under hour12: false.
  const hour = get('hour') === '24' ? '00' : get('hour');

  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}

/**
 * A wall-clock string as milliseconds, read exactly as written rather than in
 * any particular zone. Only meaningful between values sharing a timezone — the
 * offset is identical on both sides, so it cancels out in the subtraction.
 */
export function wallClockMs(naiveIso: string): number {
  return Date.parse(`${naiveIso}Z`);
}

/** A wall-clock string rendered in the viewer's preferred 12h/24h format. */
export function formatWallClockTime(naiveIso: string, format: TimeFormat): string {
  if (!naiveIso) return '--';
  const hour = Number(naiveIso.slice(11, 13));
  const minutes = naiveIso.slice(14, 16);
  if (format === '24h') {
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  }
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
}
