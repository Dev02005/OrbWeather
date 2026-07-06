import React from 'react';
import { MapPin } from 'lucide-react';
import type { WeatherData, CityMeta } from '../types';
import { getWMO } from '../api/weather';
import { getWeatherIcon } from '../utils/iconMap';
import './HeroCard.css';

interface HeroCardProps {
  weather: WeatherData;
  cityMeta: CityMeta;
  unit: 'celsius' | 'fahrenheit';
  timeFormat: '12h' | '24h';
}

export function HeroCard({ weather, cityMeta, timeFormat, unit }: HeroCardProps) {
  const c = weather.current;
  const isDay = c.is_day === 1;
  const info = getWMO(c.weather_code);
  const IconComponent = getWeatherIcon(c.weather_code, isDay);

  const dateStr = new Date().toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: timeFormat === '12h',
    timeZone: weather.timezone,
  });

  const todayHi = weather.daily.temperature_2m_max[0];
  const todayLo = weather.daily.temperature_2m_min[0];

  return (
    <section className="hero-section">
      <div className={`hero-bg-overlay bg-${info.bg}`}></div>
      <div className="hero-content">
        <div className="hero-left">
          <div className="location-info">
            <div className="location-badge">
              <MapPin size={14} />
              <span>{cityMeta.admin1 ? `${cityMeta.admin1}, ${cityMeta.country}` : (cityMeta.country || cityMeta.countryCode)}</span>
            </div>
            <h1 className="hero-city">{cityMeta.name}</h1>
            <p className="hero-datetime">{dateStr}</p>
          </div>
          <div className="temp-display">
            <span className="hero-temp">{Math.round(c.temperature_2m)}°{unit === 'celsius' ? 'C' : 'F'}</span>
            <div className="temp-details">
              <p className="feels-like">Feels like {Math.round(c.apparent_temperature)}°</p>
              <p className="hi-lo">H:{Math.round(todayHi)}° L:{Math.round(todayLo)}°</p>
            </div>
          </div>
          <div className="weather-desc-row">
            <span className="weather-desc">{info.label}</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-icon-wrapper">
            <IconComponent size={140} className="hero-weather-icon" strokeWidth={1} />
            <div className="icon-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
