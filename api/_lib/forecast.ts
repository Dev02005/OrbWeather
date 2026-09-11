import type { ForecastSnapshot } from './types.js';

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

export type FetchForecast = (lat: number, lon: number) => Promise<ForecastSnapshot>;

interface OpenMeteoResponse {
  current?: { time?: string; weather_code?: number };
  hourly?: {
    time?: string[];
    weather_code?: number[];
    precipitation_probability?: (number | null)[];
  };
}

/**
 * The current code plus hourly codes and rain chances, in the city's own
 * timezone. Two days are requested so a late-evening check can still see the
 * hours after midnight.
 */
export const fetchForecast: FetchForecast = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'weather_code',
    hourly: 'weather_code,precipitation_probability',
    timezone: 'auto',
    forecast_days: '2',
  });

  const res = await fetch(`${FORECAST_API}?${params}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);

  const data = (await res.json()) as OpenMeteoResponse;
  const { current, hourly } = data;
  if (!current?.time || current.weather_code === undefined || !hourly?.time || !hourly.weather_code) {
    throw new Error('Open-Meteo response was missing expected fields');
  }

  return {
    currentTime: current.time,
    currentCode: current.weather_code,
    hourly: {
      time: hourly.time,
      weather_code: hourly.weather_code,
      precipitation_probability: (hourly.precipitation_probability ?? []).map(p => p ?? 0),
    },
  };
};
