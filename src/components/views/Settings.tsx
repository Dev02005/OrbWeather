import { Moon, Sun, Thermometer, Clock, Bell, Download } from 'lucide-react';
import { useToast } from '../../contexts/toast-context';
import { WeatherAlerts } from '../WeatherAlerts';
import { InstallApp } from '../InstallApp';
import type { CityMeta } from '../../types';
import './Views.css';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  unit: 'celsius' | 'fahrenheit';
  setUnit: (u: 'celsius' | 'fahrenheit') => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (f: '12h' | '24h') => void;
  currentCity: CityMeta | null;
}

export function Settings({ theme, setTheme, unit, setUnit, timeFormat, setTimeFormat, currentCity }: SettingsProps) {
  const { showToast } = useToast();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    showToast('Theme Updated', `Theme set to ${newTheme} mode.`, 'success');
  };

  const handleUnitChange = (newUnit: 'celsius' | 'fahrenheit') => {
    setUnit(newUnit);
    showToast('Unit Updated', `Temperature set to ${newUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}.`, 'success');
  };

  const handleTimeFormatChange = (newFormat: '12h' | '24h') => {
    setTimeFormat(newFormat);
    showToast('Time Format Updated', `Time format set to ${newFormat}.`, 'success');
  };

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
            <button className={`setting-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => handleThemeChange('light')}>Light</button>
            <button className={`setting-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>Dark</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Thermometer size={20} />
            <h2>Temperature Unit</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${unit === 'celsius' ? 'active' : ''}`} onClick={() => handleUnitChange('celsius')}>Celsius (°C)</button>
            <button className={`setting-btn ${unit === 'fahrenheit' ? 'active' : ''}`} onClick={() => handleUnitChange('fahrenheit')}>Fahrenheit (°F)</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Clock size={20} />
            <h2>Time Format</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${timeFormat === '12h' ? 'active' : ''}`} onClick={() => handleTimeFormatChange('12h')}>12-Hour (AM/PM)</button>
            <button className={`setting-btn ${timeFormat === '24h' ? 'active' : ''}`} onClick={() => handleTimeFormatChange('24h')}>24-Hour</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Download size={20} />
            <h2>Install App</h2>
          </div>
          <InstallApp />
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <Bell size={20} />
            <h2>Weather Alerts</h2>
          </div>
          <WeatherAlerts currentCity={currentCity} timeFormat={timeFormat} />
        </div>

      </div>
    </div>
  );
}
