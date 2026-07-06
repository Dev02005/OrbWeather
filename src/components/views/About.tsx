import React from 'react';
import './Views.css';

export function About() {
  return (
    <div className="view-container animate-fade-up">
      <div className="view-header">
        <h1>About OrbWeather</h1>
      </div>
      <div className="view-content">
        <p><strong>OrbWeather</strong> is a premium, data-rich weather dashboard engineered by Praneeth Karri. It is built to give you the most accurate and beautiful weather forecasts at a single glance, without any unnecessary clutter.</p>
        
        <h3 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>Key Features</h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '20px', marginBottom: '24px' }}>
          <li><strong>Real-Time Predictive Forecasts:</strong> A highly detailed 24-hour curve and a 7-day outlook to plan your week perfectly.</li>
          <li><strong>Interactive Global Map:</strong> Explore the globe and instantly pull weather data from any location by simply clicking on the map.</li>
          <li><strong>Air Quality Analysis:</strong> Deep tracking of localized air pollutants (PM2.5, PM10, Ozone, and Nitrogen Dioxide) to keep you safe.</li>
          <li><strong>Astronomical Data:</strong> Live tracking of the sun's position, daylight duration, exact UV indexes, and current moon phases.</li>
          <li><strong>Smart Notifications:</strong> Opt-in desktop alerts that warn you of severe weather conditions in your active city.</li>
        </ul>

        <p>How does it work? OrbWeather continuously streams raw meteorological data from Open-Meteo's advanced weather models. When you search or use your current location, it utilizes reverse-geocoding technology to instantly map your precise GPS coordinates into accurate local forecasts.</p>
        
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '8px', margin: '32px 0 0 0' }}>
          <strong>Caution:</strong> The weather forecasts, air quality indices, and other meteorological data provided by this application are model-based predictions. While we strive for accuracy using advanced models, these are not absolute certainties and should not be used as the sole source of information for critical decisions or safety planning.
        </div>
      </div>
    </div>
  );
}
