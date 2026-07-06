import type { Coordinates, WeatherData, AirQualityData } from '../types';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const AQ_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function fetchWeather(
  coords: Coordinates,
  unit: 'celsius' | 'fahrenheit'
): Promise<{ weather: WeatherData; aq: AirQualityData }> {
  const unitParam = unit === 'celsius' ? 'celsius' : 'fahrenheit';
  const windUnit = unit === 'celsius' ? 'kmh' : 'mph';

  const weatherParams = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,is_day',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
    temperature_unit: unitParam,
    wind_speed_unit: windUnit,
    timezone: 'auto',
    forecast_days: '7',
  });

  const aqParams = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lon.toString(),
    current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,european_aqi',
    timezone: 'auto',
  });

  const weatherURL = `${WEATHER_API}?${weatherParams.toString()}`;
  const aqURL = `${AQ_API}?${aqParams.toString()}`;

  const [weatherRes, aqRes] = await Promise.all([
    fetch(weatherURL),
    fetch(aqURL),
  ]);

  if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
  if (!aqRes.ok) throw new Error('Failed to fetch air quality data');

  const weather = await weatherRes.json();
  const aq = await aqRes.json();

  return { weather, aq };
}

// ─── WMO Weather Code → { label, bg } ────────────────────
export const WMO: Record<number, { label: string; bg: string }> = {
  0: { label: 'Clear Sky', bg: 'clear' },
  1: { label: 'Mainly Clear', bg: 'clear' },
  2: { label: 'Partly Cloudy', bg: 'clouds' },
  3: { label: 'Overcast', bg: 'clouds' },
  45: { label: 'Foggy', bg: 'mist' },
  48: { label: 'Icy Fog', bg: 'mist' },
  51: { label: 'Light Drizzle', bg: 'rain' },
  53: { label: 'Moderate Drizzle', bg: 'rain' },
  55: { label: 'Dense Drizzle', bg: 'rain' },
  61: { label: 'Light Rain', bg: 'rain' },
  63: { label: 'Moderate Rain', bg: 'rain' },
  65: { label: 'Heavy Rain', bg: 'rain' },
  71: { label: 'Light Snow', bg: 'snow' },
  73: { label: 'Moderate Snow', bg: 'snow' },
  75: { label: 'Heavy Snow', bg: 'snow' },
  77: { label: 'Snow Grains', bg: 'snow' },
  80: { label: 'Slight Showers', bg: 'rain' },
  81: { label: 'Rain Showers', bg: 'rain' },
  82: { label: 'Heavy Showers', bg: 'rain' },
  85: { label: 'Snow Showers', bg: 'snow' },
  86: { label: 'Heavy Snow Showers', bg: 'snow' },
  95: { label: 'Thunderstorm', bg: 'thunderstorm' },
  96: { label: 'Thunderstorm + Hail', bg: 'thunderstorm' },
  99: { label: 'Thunderstorm + Hail', bg: 'thunderstorm' },
};

export function getWMO(code: number) {
  return WMO[code] || { label: 'Unknown', bg: 'default' };
}
