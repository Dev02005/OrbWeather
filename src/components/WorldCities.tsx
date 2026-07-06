import React, { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';
import type { CityMeta, WeatherData } from '../types';
import { fetchWeather, getWMO } from '../api/weather';
import { getWeatherIcon } from '../utils/iconMap';
import './WorldCities.css';

interface WorldCitiesProps {
  unit: 'celsius' | 'fahrenheit';
  savedCities: CityMeta[];
  onCitySelect: (city: CityMeta) => void;
}

export function WorldCities({ unit, savedCities, onCitySelect }: WorldCitiesProps) {
  const [data, setData] = useState<Record<string, WeatherData>>({});

  useEffect(() => {
    async function loadData() {
      if (savedCities.length === 0) return;
      try {
        const results = await Promise.allSettled(
          savedCities.map(city => fetchWeather({ lat: city.lat, lon: city.lon }, unit))
        );
        const newData: Record<string, WeatherData> = {};
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            newData[savedCities[idx].name] = res.value.weather;
          }
        });
        setData(newData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [unit, savedCities]);

  if (savedCities.length === 0) {
    return null; // Don't show the section if no cities are saved
  }

  return (
    <section className="world-section animate-fade-up" style={{ animationDelay: '0.4s' }}>
      <div className="section-title">
        <Globe2 size={16} />
        <span>Saved Locations</span>
      </div>
      
      <div className="world-cities-grid">
        {savedCities.map((city, idx) => {
          const w = data[city.name];
          if (!w) {
            return (
              <div key={idx} className="world-city-card skeleton">
                <div className="wc-city">{city.name}</div>
                <div className="wc-country">{city.admin1 ? `${city.admin1}, ${city.country}` : city.country}</div>
                <div className="wc-temp">--°</div>
                <div className="wc-desc">Loading...</div>
              </div>
            );
          }

          const c = w.current;
          const info = getWMO(c.weather_code);
          const Icon = getWeatherIcon(c.weather_code, c.is_day === 1);

          return (
            <div 
              key={idx} 
              className="world-city-card" 
              onClick={() => onCitySelect(city)}
            >
              <div className="wc-icon-wrapper">
                <Icon size={24} className="wc-icon" />
              </div>
              <div className="wc-city">{city.name}</div>
              <div className="wc-country">{city.admin1 ? `${city.admin1}, ${city.country}` : city.country}</div>
              <div className="wc-temp">{Math.round(c.temperature_2m)}°</div>
              <div className="wc-desc">{info.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
