import React from 'react';
import { Moon, Sun, Thermometer, Clock, AlertTriangle } from 'lucide-react';
import './Views.css';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  unit: 'celsius' | 'fahrenheit';
  setUnit: (u: 'celsius' | 'fahrenheit') => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (f: '12h' | '24h') => void;
  notifications: boolean;
  setNotifications: (n: boolean) => void;
}

export function Settings({ theme, setTheme, unit, setUnit, timeFormat, setTimeFormat, notifications, setNotifications }: SettingsProps) {
  return (
    <div className="view-container animate-fade-up">
      <div className="view-header">
        <h1>Settings & Preferences</h1>
      </div>
      <div className="view-content">
        
        <div className="settings-section">
          <div className="settings-section-header">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            <h2>Theme</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light</button>
            <button className={`setting-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Thermometer size={20} />
            <h2>Temperature Unit</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${unit === 'celsius' ? 'active' : ''}`} onClick={() => setUnit('celsius')}>Celsius (°C)</button>
            <button className={`setting-btn ${unit === 'fahrenheit' ? 'active' : ''}`} onClick={() => setUnit('fahrenheit')}>Fahrenheit (°F)</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Clock size={20} />
            <h2>Time Format</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${timeFormat === '12h' ? 'active' : ''}`} onClick={() => setTimeFormat('12h')}>12-Hour (AM/PM)</button>
            <button className={`setting-btn ${timeFormat === '24h' ? 'active' : ''}`} onClick={() => setTimeFormat('24h')}>24-Hour</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <AlertTriangle size={20} />
            <h2>Desktop Notifications</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${notifications ? 'active' : ''}`} onClick={() => setNotifications(true)}>Enabled</button>
            <button className={`setting-btn ${!notifications ? 'active' : ''}`} onClick={() => setNotifications(false)}>Disabled</button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Get alerted instantly if severe weather (like thunderstorms or heavy snow) is detected in your selected city.
          </p>
        </div>

      </div>
    </div>
  );
}
