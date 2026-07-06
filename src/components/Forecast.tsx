import React, { useState } from 'react';
import { Clock, CalendarDays, Droplets } from 'lucide-react';
import type { WeatherData } from '../types';
import { getWMO } from '../api/weather';
import { getWeatherIcon } from '../utils/iconMap';
import './Forecast.css';

interface ForecastProps {
  weather: WeatherData;
  timeFormat: '12h' | '24h';
}

function formatHour(isoStr: string, timeFormat: '12h' | '24h') {
  const d = new Date(isoStr);
  const h = d.getHours();
  if (timeFormat === '24h') {
    return `${h.toString().padStart(2, '0')}:00`;
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}${ampm}`;
}

function formatDay(isoStr: string) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(isoStr).getDay()];
}

export function Forecast({ weather, timeFormat }: ForecastProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  
  const isDay = weather.current.is_day === 1;

  // Hourly Forecast logic
  const nowHour = new Date().toISOString().slice(0, 13);
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
    <div className="forecast-container animate-fade-up" style={{ animationDelay: '0.2s' }}>
      
      {/* 24-Hour Forecast */}
      <section className="forecast-card">
        <div className="section-title">
          <Clock size={16} />
          <span>24-Hour Forecast</span>
        </div>
        <div className="hourly-scroll">
          {hourlyData.map((h, idx) => {
            const Icon = getWeatherIcon(h.code, isDay);
            return (
              <div key={idx} className={`hourly-item ${h.isNow ? 'now-item' : ''}`}>
                <span className="hourly-time">{h.isNow ? 'Now' : formatHour(h.time, timeFormat)}</span>
                <Icon size={28} className="hourly-icon" strokeWidth={1.5} />
                <span className="hourly-temp">{Math.round(h.temp)}°</span>
                {h.pop > 0 ? (
                  <span className="hourly-pop"><Droplets size={10}/> {h.pop}%</span>
                ) : (
                  <span className="hourly-pop" style={{ opacity: 0 }}>0%</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7-Day Forecast */}
      <section className="forecast-card">
        <div className="section-title">
          <CalendarDays size={16} />
          <span>7-Day Forecast</span>
        </div>
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
                  style={{ cursor: 'pointer' }}
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
                    <div className="hourly-scroll" style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '12px', padding: '12px' }}>
                      {Array.from({ length: 24 }).map((_, hIdx) => {
                        const globalIdx = idx * 24 + hIdx;
                        const hTime = weather.hourly.time[globalIdx];
                        const hCode = weather.hourly.weather_code[globalIdx];
                        const hTemp = weather.hourly.temperature_2m[globalIdx];
                        const hPop = weather.hourly.precipitation_probability ? weather.hourly.precipitation_probability[globalIdx] : 0;
                        const HIcon = getWeatherIcon(hCode, true);
                        
                        return (
                          <div key={hIdx} className="hourly-item">
                            <span className="hourly-time">{formatHour(hTime, timeFormat)}</span>
                            <HIcon size={24} className="hourly-icon" strokeWidth={1.5} />
                            <span className="hourly-temp">{Math.round(hTemp)}°</span>
                            {hPop > 0 ? (
                              <span className="hourly-pop"><Droplets size={10}/> {hPop}%</span>
                            ) : (
                              <span className="hourly-pop" style={{ opacity: 0 }}>0%</span>
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
