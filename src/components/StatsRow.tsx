import React from 'react';
import { Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Navigation } from 'lucide-react';
import type { WeatherData } from '../types';
import './StatsRow.css';

interface StatsRowProps {
  weather: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

function degreesToCardinal(deg: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatSunTime(isoStr: string) {
  if (!isoStr) return '--';
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function StatsRow({ weather, unit }: StatsRowProps) {
  const c = weather.current;
  const windLabel = unit === 'celsius' ? `${Math.round(c.wind_speed_10m)} km/h` : `${Math.round(c.wind_speed_10m)} mph`;
  const windDeg = c.wind_direction_10m || 0;
  const vis = c.visibility != null ? (c.visibility / 1000).toFixed(1) : '--';

  return (
    <section className="stats-row animate-fade-up" style={{ animationDelay: '0.1s' }}>
      
      <div className="stat-card">
        <Droplets className="stat-icon text-blue" />
        <div className="stat-info">
          <span className="stat-label">Humidity</span>
          <span className="stat-value">{c.relative_humidity_2m}%</span>
        </div>
        <div className="stat-bar-track">
          <div className="stat-bar-fill bg-blue" style={{ width: `${c.relative_humidity_2m}%` }}></div>
        </div>
      </div>

      <div className="stat-card">
        <Wind className="stat-icon text-teal" />
        <div className="stat-info">
          <span className="stat-label">Wind Speed</span>
          <span className="stat-value">{windLabel}</span>
        </div>
        <div className="wind-direction">
          <div className="compass">
            <Navigation size={12} className="compass-arrow" style={{ transform: `rotate(${windDeg}deg)` }} />
          </div>
          <span className="wind-dir-label">{degreesToCardinal(windDeg)}</span>
        </div>
      </div>

      <div className="stat-card">
        <Eye className="stat-icon text-indigo" />
        <div className="stat-info">
          <span className="stat-label">Visibility</span>
          <span className="stat-value">{vis} km</span>
        </div>
      </div>

      <div className="stat-card">
        <Gauge className="stat-icon text-purple" />
        <div className="stat-info">
          <span className="stat-label">Pressure</span>
          <span className="stat-value">{Math.round(c.surface_pressure)} hPa</span>
        </div>
      </div>

      <div className="stat-card">
        <Sunrise className="stat-icon text-amber" />
        <div className="stat-info">
          <span className="stat-label">Sunrise</span>
          <span className="stat-value">{formatSunTime(weather.daily.sunrise[0])}</span>
        </div>
      </div>

      <div className="stat-card">
        <Sunset className="stat-icon text-rose" />
        <div className="stat-info">
          <span className="stat-label">Sunset</span>
          <span className="stat-value">{formatSunTime(weather.daily.sunset[0])}</span>
        </div>
      </div>

    </section>
  );
}
