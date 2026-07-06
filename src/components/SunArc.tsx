import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import './SunArc.css';

interface SunArcProps {
  sunrise: string;
  sunset: string;
  timeFormat: '12h' | '24h';
}

function formatTime(iso: string, format: '12h' | '24h') {
  const d = new Date(iso);
  if (format === '24h') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function SunArc({ sunrise, sunset, timeFormat }: SunArcProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date().getTime();
      const sr = new Date(sunrise).getTime();
      const ss = new Date(sunset).getTime();
      
      if (now < sr) setProgress(0);
      else if (now > ss) setProgress(100);
      else {
        const total = ss - sr;
        const passed = now - sr;
        setProgress((passed / total) * 100);
      }
    };
    
    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  // SVG Arc Math
  // Radius = 100, Center = (120, 110)
  // Arc goes from 180 deg to 0 deg
  const radius = 100;
  const cx = 120;
  const cy = 110;
  
  // Angle for the sun based on progress (0 to 100) -> (180 to 0 degrees) -> (PI to 0 radians)
  const angle = Math.PI - (progress / 100) * Math.PI;
  const sunX = cx + radius * Math.cos(angle);
  const sunY = cy - radius * Math.sin(angle);

  return (
    <section className="sun-arc-card animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <div className="sac-header">
        <h3>Daylight</h3>
      </div>
      
      <div className="sac-visualizer">
        <svg viewBox="0 0 240 130" className="sac-svg">
          {/* Background Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
          {/* Progress Arc */}
          {progress > 0 && (
            <path
              d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${sunX} ${sunY}`}
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="4"
            />
          )}
          {/* The Sun */}
          {(progress > 0 && progress < 100) && (
            <circle cx={sunX} cy={sunY} r="8" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
          )}
        </svg>
      </div>

      <div className="sac-footer">
        <div className="sac-time-block">
          <Sunrise size={20} className="sac-icon" />
          <div className="sac-time-col">
            <span className="sac-label">Sunrise</span>
            <span className="sac-time">{formatTime(sunrise, timeFormat)}</span>
          </div>
        </div>
        <div className="sac-time-block right">
          <div className="sac-time-col">
            <span className="sac-label">Sunset</span>
            <span className="sac-time">{formatTime(sunset, timeFormat)}</span>
          </div>
          <Sunset size={20} className="sac-icon" />
        </div>
      </div>
    </section>
  );
}
