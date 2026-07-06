export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CityMeta {
  name: string;
  countryCode: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    visibility: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
  timezone: string;
}

export interface AirQualityData {
  current: {
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    ozone: number;
    sulphur_dioxide: number;
    european_aqi: number;
  };
}
