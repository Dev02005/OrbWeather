import type { Alert, AlertKind, ForecastSnapshot, TimeFormat } from './types.js';

/** How far ahead to look, in hours after the current one. */
export const LOOKAHEAD_HOURS = 2;
/** Minimum gap between two alerts of the same kind to the same device. */
export const COOLDOWN_MS = 6 * 60 * 60 * 1000;
/** Precipitation probability, in percent, that counts as "rain likely". */
export const RAIN_THRESHOLD = 70;

/** WMO codes worth waking someone's phone for, with how to describe them. */
const SEVERE: Record<number, { label: string; icon: string }> = {
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🧊' },
  67: { label: 'Freezing rain', icon: '🧊' },
  75: { label: 'Heavy snow', icon: '❄️' },
  82: { label: 'Violent rain showers', icon: '🌧️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

/** Drizzle, rain, showers and thunderstorms — anything already wet. */
function isWet(code: number) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
}

export function isSevere(code: number) {
  return code in SEVERE;
}

/** "2026-09-11T16:00" → "4 PM" or "16:00", read straight off the city's clock. */
export function formatAlertHour(time: string, format: TimeFormat) {
  const hour = Number(time.slice(11, 13));
  if (format === '24h') return `${String(hour).padStart(2, '0')}:00`;
  return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/**
 * The current hour and the LOOKAHEAD_HOURS after it. Every timestamp is the
 * city's wall clock in the same format, so they compare as plain strings.
 */
function upcomingHours(forecast: ForecastSnapshot) {
  const currentHour = forecast.currentTime.slice(0, 13);
  const start = forecast.hourly.time.findIndex(t => t.slice(0, 13) >= currentHour);
  if (start === -1) return [];

  return forecast.hourly.time.slice(start, start + LOOKAHEAD_HOURS + 1).map((time, i) => ({
    time,
    code: forecast.hourly.weather_code[start + i],
    probability: forecast.hourly.precipitation_probability[start + i] ?? 0,
    isCurrentHour: i === 0,
  }));
}

function cooledDown(kind: AlertKind, lastSent: Partial<Record<AlertKind, number>>, now: number) {
  const last = lastSent[kind];
  return last === undefined || now - last >= COOLDOWN_MS;
}

/**
 * Decides whether a device should be alerted right now, and with what.
 *
 * Severe weather outranks rain: while a storm is around, a separate "rain
 * likely" alert would only be noise, even if the storm alert is cooling down.
 */
export function decideAlert(
  cityName: string,
  forecast: ForecastSnapshot,
  lastSent: Partial<Record<AlertKind, number>>,
  now: number,
  timeFormat: TimeFormat = '12h'
): Alert | null {
  const hours = upcomingHours(forecast);

  const severeNow = isSevere(forecast.currentCode) ? forecast.currentCode : null;
  const severeSoon = hours.find(h => !h.isCurrentHour && isSevere(h.code));

  if (severeNow !== null || severeSoon) {
    if (!cooledDown('severe', lastSent, now)) return null;

    const code = severeNow ?? severeSoon!.code;
    const { label, icon } = SEVERE[code];
    return {
      kind: 'severe',
      tag: 'orbweather-severe',
      title: severeNow !== null
        ? `${icon} ${label} in ${cityName}`
        : `${icon} ${label} expected in ${cityName}`,
      body: severeNow !== null
        ? 'Happening now. Stay indoors if you can.'
        : `Expected around ${formatAlertHour(severeSoon!.time, timeFormat)}. Plan ahead and stay safe.`,
    };
  }

  if (isWet(forecast.currentCode)) return null; // already raining — nothing new to say

  const rainSoon = hours.find(h => !h.isCurrentHour && h.probability >= RAIN_THRESHOLD);
  if (rainSoon && cooledDown('rain', lastSent, now)) {
    return {
      kind: 'rain',
      tag: 'orbweather-rain',
      title: `🌧️ Rain likely in ${cityName}`,
      body: `${rainSoon.probability}% chance around ${formatAlertHour(rainSoon.time, timeFormat)}.`,
    };
  }

  return null;
}
