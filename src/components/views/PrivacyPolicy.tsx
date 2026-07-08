import React from 'react';
import './Standalone.css';

export function PrivacyPolicy() {
  return (
    <div className="standalone-container">
      <h1 className="standalone-title">Privacy Policy</h1>
      <div className="standalone-content">
        <p>Your privacy is important to us. This Privacy Policy explains how OrbWeather collects, uses, and protects your information when you use our application.</p>
        
        <h3>Information We Collect</h3>
        <p><strong>Location Data:</strong> To provide you with hyper-local weather forecasts and air quality data, we request access to your device's location. This data is only used locally within your browser and sent securely to our third-party weather data provider (Open-Meteo) to fetch relevant forecasts. We do not store your location data on any servers we control.</p>
        <p><strong>Preferences:</strong> We store your settings (such as theme, temperature units, and saved cities) directly on your device using local storage. This ensures your preferences are remembered the next time you visit without the need for an account.</p>

        <h3>How We Use Your Information</h3>
        <p>The information we collect is used strictly for the operation of the OrbWeather application:</p>
        <ul>
          <li>To display local weather conditions, radar maps, and air quality indices.</li>
          <li>To provide desktop notifications for severe weather (if enabled).</li>
          <li>To maintain your preferred application settings.</li>
        </ul>

        <h3>Third-Party Services</h3>
        <p>We use Open-Meteo as our primary weather data provider. When we request weather data for your location, your IP address and coordinate data may be processed by Open-Meteo in accordance with their privacy policy.</p>

        <h3>Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. Any changes will be reflected in this document. By continuing to use the application, you consent to the updated policy.</p>
      </div>
    </div>
  );
}
