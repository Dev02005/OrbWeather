import React from 'react';
import { Moon, Sun, Thermometer, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
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

  const handleNotificationChange = (newVal: boolean) => {
    setNotifications(newVal);
    if (newVal) {
      showToast('Notifications Enabled', 'You will now receive alerts for severe weather.', 'success');
    } else {
      showToast('Notifications Disabled', 'Severe weather alerts have been muted.', 'info');
    }
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
            <AlertTriangle size={20} />
            <h2>Notifications</h2>
          </div>
          <div className="settings-options">
            <button className={`setting-btn ${notifications ? 'active' : ''}`} onClick={() => handleNotificationChange(true)}>Enabled</button>
            <button className={`setting-btn ${!notifications ? 'active' : ''}`} onClick={() => handleNotificationChange(false)}>Disabled</button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Get alerted instantly if severe weather (like thunderstorms or heavy snow) is detected in your selected city.
          </p>
          <div style={{ marginTop: '12px' }}>
            <button 
              className="setting-btn" 
              onClick={async () => {
                if (!('Notification' in window)) {
                  alert('Notifications are not supported by this browser.');
                  return;
                }
                
                let perm = Notification.permission;
                if (perm !== 'granted') {
                  perm = await Notification.requestPermission();
                  if (perm !== 'granted') {
                    alert('Please enable notifications first or check your browser permissions.');
                    return;
                  }
                }

                try {
                  let swReg = null;
                  if ('serviceWorker' in navigator) {
                    swReg = await navigator.serviceWorker.getRegistration();
                  }
                  
                  if (swReg) {
                    await swReg.showNotification('OrbWeather Test', {
                      body: 'Notifications are working perfectly!',
                      icon: '/icon.png'
                    });
                  } else {
                    new Notification('OrbWeather Test', {
                      body: 'Notifications are working perfectly!',
                      icon: '/icon.png'
                    });
                  }
                } catch (err) {
                  console.error('Notification error:', err);
                  alert('Failed to show notification. Check browser permissions.');
                }
              }}
            >
              Test Notification
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
