import React from 'react';
import { Sun, Moon, AlertTriangle } from 'lucide-react';
import './UvMoonCard.css';

interface UvMoonCardProps {
  uvIndex: number;
}

function getMoonPhase() {
  const date = new Date();
  const LUNAR_MONTH = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const diffDays = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = (diffDays % LUNAR_MONTH) / LUNAR_MONTH;

  if (phase < 0.0625 || phase > 0.9375) return { label: 'New Moon', emoji: '🌑' };
  if (phase < 0.1875) return { label: 'Waxing Crescent', emoji: '🌒' };
  if (phase < 0.3125) return { label: 'First Quarter', emoji: '🌓' };
  if (phase < 0.4375) return { label: 'Waxing Gibbous', emoji: '🌔' };
  if (phase < 0.5625) return { label: 'Full Moon', emoji: '🌕' };
  if (phase < 0.6875) return { label: 'Waning Gibbous', emoji: '🌖' };
  if (phase < 0.8125) return { label: 'Last Quarter', emoji: '🌗' };
  return { label: 'Waning Crescent', emoji: '🌘' };
}

function getUvRisk(uv: number) {
  if (uv < 3) return { label: 'Low', color: '#10b981', desc: 'No protection needed' };
  if (uv < 6) return { label: 'Moderate', color: '#f59e0b', desc: 'Wear sunscreen' };
  if (uv < 8) return { label: 'High', color: '#ef4444', desc: 'Protection essential' };
  if (uv < 11) return { label: 'Very High', color: '#b91c1c', desc: 'Extra protection needed' };
  return { label: 'Extreme', color: '#7f1d1d', desc: 'Stay indoors if possible' };
}

export function UvMoonCard({ uvIndex }: UvMoonCardProps) {
  const moon = getMoonPhase();
  const uvRisk = getUvRisk(uvIndex);

  return (
    <section className="uv-moon-card animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <div className="um-column">
        <div className="um-header">
          <Sun size={20} className="um-icon" style={{ color: uvRisk.color }} />
          <span>UV Index</span>
        </div>
        <div className="um-body">
          <div className="uv-value" style={{ color: uvRisk.color }}>{Math.round(uvIndex)}</div>
          <div className="uv-info">
            <div className="uv-label">{uvRisk.label} Risk</div>
            <div className="uv-desc">{uvRisk.desc}</div>
          </div>
        </div>
      </div>
      
      <div className="um-divider"></div>
      
      <div className="um-column">
        <div className="um-header">
          <Moon size={20} className="um-icon" />
          <span>Moon Phase</span>
        </div>
        <div className="um-body">
          <div className="moon-emoji">{moon.emoji}</div>
          <div className="moon-info">
            <div className="moon-label">{moon.label}</div>
            <div className="moon-desc">Current Lunar Cycle</div>
          </div>
        </div>
      </div>
    </section>
  );
}
