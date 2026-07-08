import React from 'react';
import { Wind } from 'lucide-react';
import type { AirQualityData } from '../types';
import './AirQuality.css';

interface AirQualityProps {
  aq: AirQualityData;
}

export function AirQuality({ aq }: AirQualityProps) {
  const c = aq.current;
  const aqi = c.european_aqi;

  const aqiBands = [
    { max: 20,  label: 'Good',           color: '#10b981' }, // emerald
    { max: 40,  label: 'Fair',           color: '#84cc16' }, // lime
    { max: 60,  label: 'Moderate',       color: '#f59e0b' }, // amber
    { max: 80,  label: 'Poor',           color: '#f97316' }, // orange
    { max: 100, label: 'Very Poor',      color: '#ef4444' }, // red
    { max: 999, label: 'Extremely Poor', color: '#7f1d1d' }, // dark red
  ];

  const band = aqiBands.find(b => aqi <= b.max) || aqiBands[aqiBands.length - 1];
  
  const maxAQI = 150;
  const pct = Math.min((aqi || 0) / maxAQI, 1);
  const offset = 173 - pct * 173;

  const comps = [
    { label: 'PM2.5', val: c.pm2_5, unit: 'μg/m³' },
    { label: 'PM10', val: c.pm10, unit: 'μg/m³' },
    { label: 'CO', val: c.carbon_monoxide, unit: 'μg/m³' },
    { label: 'NO₂', val: c.nitrogen_dioxide, unit: 'μg/m³' },
    { label: 'O₃', val: c.ozone, unit: 'μg/m³' },
    { label: 'SO₂', val: c.sulphur_dioxide, unit: 'μg/m³' },
  ];

  return (
    <section className="aq-section animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <div className="section-title">
        <Wind size={16} />
        <span>Air Quality Index</span>
      </div>
      
      <div className="aq-card">
        <div className="aq-gauge">
          <svg className="aq-svg" viewBox="0 0 120 80">
            <path 
              d="M10 70 A55 55 0 0 1 110 70" 
              fill="none" 
              stroke="var(--bg-primary)" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
            <path 
              className="aq-arc-animated"
              d="M10 70 A55 55 0 0 1 110 70" 
              fill="none" 
              stroke="url(#aqGrad)" 
              strokeWidth="10" 
              strokeLinecap="round" 
              strokeDasharray="173" 
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="aqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="50%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#ef4444"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="aq-center-text">
            <span className="aq-value" style={{ color: band.color }}>{aqi ?? '--'}</span>
            <span className="aq-label">{band.label}</span>
          </div>
        </div>

        <div className="aq-breakdown">
          {comps.map((item, idx) => (
            <div key={idx} className="aq-item">
              <span className="aq-item-label">{item.label}</span>
              <span className="aq-item-value">{item.val != null ? item.val.toFixed(1) : '--'}</span>
              <span className="aq-item-unit">{item.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="aq-legend">
        {aqiBands.map((b, idx) => (
          <div key={idx} className="aq-legend-item">
            <span className="aq-legend-color" style={{ backgroundColor: b.color }}></span>
            <span className="aq-legend-label">{b.label}</span>
            <span className="aq-legend-range">
              {idx === 0 ? '0' : aqiBands[idx - 1].max + 1}-{b.max === 999 ? '+' : b.max}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
