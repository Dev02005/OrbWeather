import React, { useState } from 'react';
import { Clock, CalendarDays, Droplets } from 'lucide-react';
import type { TimeFormat, WeatherData } from '../types';
import { getWMO } from '../services/weather';
import { getWeatherIcon } from '../utils/iconMap';
import { cityNow } from '../utils/time';
import { formatDay, formatHour, isDaylightAt } from '../utils/forecast';
import './Forecast.css';

interface ForecastProps {
  weather: WeatherData;
  timeFormat: TimeFormat;
}

export function Forecast({ weather, timeFormat }: ForecastProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Hourly Forecast logic — hourly.time is the city's wall clock, so the
  // cursor has to be the city's current hour, not the browser's or UTC's.
  const nowHour = cityNow(weather.timezone).slice(0, 13);
  let startIdx = weather.hourly.time.findIndex(t => t.slice(0, 13) >= nowHour);
  if (startIdx < 0) startIdx = 0;
  
  const hourlyData = weather.hourly.time.slice(startIdx, startIdx + 24).map((time, idx) => ({
    time,
    temp: weather.hourly.temperature_2m[startIdx + idx],
    code: weather.hourly.weather_code[startIdx + idx],
    pop: weather.hourly.precipitation_probability ? weather.hourly.precipitation_probability[startIdx + idx] : 0,
    isNow: idx === 0
  }));

  // Weekly Forecast logic
  const daily = weather.daily;
  const allHi = daily.temperature_2m_max;
  const allLo = daily.temperature_2m_min;
  const gMin = Math.min(...allLo);
  const gMax = Math.max(...allHi);

  const weeklyData = daily.time.map((time, i) => ({
    time,
    hi: allHi[i],
    lo: allLo[i],
    code: daily.weather_code[i],
    isToday: i === 0
  }));

  return (
    <div className="forecast-container animate-fade-up fade-delay-2">
      
      {/* 24-Hour Forecast */}
      <section className="forecast-card">
        <h2 className="section-title">
          <Clock size={16} />
          <span>24-Hour Forecast</span>
        </h2>
        {/* Focusable so keyboard users can scroll it with the arrow keys. */}
        <div className="hourly-scroll" tabIndex={0} role="region" aria-label="Hourly forecast for the next 24 hours">
          {hourlyData.map((h, idx) => {
            const Icon = getWeatherIcon(h.code, isDaylightAt(h.time, daily));
            return (
              <div key={idx} className={`hourly-item ${h.isNow ? 'now-item' : ''}`}>
                <span className="hourly-time">{h.isNow ? 'Now' : formatHour(h.time, timeFormat)}</span>
                <Icon size={28} className="hourly-icon" strokeWidth={1.5} />
                <span className="hourly-temp">{Math.round(h.temp)}°</span>
                {h.pop > 0 ? (
                  <span className="hourly-pop"><Droplets size={10}/> {h.pop}%</span>
                ) : (
                  <span className="hourly-pop hourly-pop-empty" aria-hidden="true">0%</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7-Day Forecast */}
      <section className="forecast-card">
        <h2 className="section-title">
          <CalendarDays size={16} />
          <span>7-Day Forecast</span>
        </h2>
        <div className="weekly-list">
          {weeklyData.map((d, idx) => {
            const info = getWMO(d.code);
            const Icon = getWeatherIcon(d.code, true); // assume day icon for daily
            
            const rangeSpan = gMax - gMin || 1;
            const barLeft = Math.max(0, ((d.lo - gMin) / rangeSpan) * 100);
            const barWidth = Math.max(5, ((d.hi - d.lo) / rangeSpan) * 100);

            return (
              <React.Fragment key={idx}>
                <div
                  className={`weekly-item ${selectedDayIndex === idx ? 'expanded' : ''}`}
                  onClick={() => setSelectedDayIndex(selectedDayIndex === idx ? null : idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDayIndex(selectedDayIndex === idx ? null : idx);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedDayIndex === idx}
                  aria-label={`${d.isToday ? 'Today' : formatDay(d.time)}: ${info.label}, high ${Math.round(d.hi)} degrees, low ${Math.round(d.lo)} degrees. Show hourly detail.`}
                >
                  <span className="weekly-day">{d.isToday ? 'Today' : formatDay(d.time)}</span>
                  <div className="weekly-icon-wrapper">
                    <Icon size={24} className="weekly-icon" />
                    <span className="weekly-desc">{info.label}</span>
                  </div>
                  <div className="weekly-range">
                    <span className="weekly-lo">{Math.round(d.lo)}°</span>
                    <div className="weekly-bar-track">
                      <div 
                        className="weekly-bar-fill" 
                        style={{ marginLeft: `${barLeft}%`, width: `${barWidth}%` }}
                      ></div>
                    </div>
                    <span className="weekly-hi">{Math.round(d.hi)}°</span>
                  </div>
                </div>

                {/* Expanded Hourly view for this day */}
                {selectedDayIndex === idx && (
                  <div className="weekly-expanded-hourly animate-fade-up">
                    <div
                      className="hourly-scroll hourly-scroll-nested"
                      tabIndex={0}
                      role="region"
                      aria-label={`Hourly forecast for ${d.isToday ? 'today' : formatDay(d.time)}`}
                    >
                      {/* Match on the day itself rather than assuming a fixed
                          24-hour stride into the hourly series. */}
                      {weather.hourly.time.reduce<number[]>((acc, t, i) => {
                        if (t.startsWith(d.time)) acc.push(i);
                        return acc;
                      }, []).map((globalIdx) => {
                        const hTime = weather.hourly.time[globalIdx];
                        const hCode = weather.hourly.weather_code[globalIdx];
                        const hTemp = weather.hourly.temperature_2m[globalIdx];
                        const hPop = weather.hourly.precipitation_probability ? weather.hourly.precipitation_probability[globalIdx] : 0;
                        const HIcon = getWeatherIcon(hCode, isDaylightAt(hTime, daily));

                        return (
                          <div key={hTime} className="hourly-item">
                            <span className="hourly-time">{formatHour(hTime, timeFormat)}</span>
                            <HIcon size={24} className="hourly-icon" strokeWidth={1.5} />
                            <span className="hourly-temp">{Math.round(hTemp)}°</span>
                            {hPop > 0 ? (
                              <span className="hourly-pop"><Droplets size={10}/> {hPop}%</span>
                            ) : (
                              <span className="hourly-pop hourly-pop-empty" aria-hidden="true">0%</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

    </div>
  );
}
