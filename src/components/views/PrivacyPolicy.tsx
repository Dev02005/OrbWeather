import './Standalone.css';

export function PrivacyPolicy() {
  return (
    <div className="standalone-container">
      <h1 className="standalone-title">Privacy Policy</h1>
      <div className="standalone-content">
        <p>Your privacy is important to us. This Privacy Policy explains how OrbWeather collects, uses, and protects your information when you use our application.</p>
        
        <h3>Information We Collect</h3>
        <p><strong>Location Data:</strong> To provide you with hyper-local weather forecasts and air quality data, we request access to your device's location. This data is only used locally within your browser and sent securely to our third-party weather data provider (Open-Meteo) to fetch relevant forecasts. We do not store your location data on any servers we control, unless you turn on weather alerts (described below).</p>
        <p><strong>Preferences:</strong> We store your settings (such as theme, temperature units, and saved cities) directly on your device using local storage. This ensures your preferences are remembered the next time you visit without the need for an account.</p>

        <h3>How We Use Your Information</h3>
        <p>The information we collect is used strictly for the operation of the OrbWeather application:</p>
        <ul>
          <li>To display local weather conditions, radar maps, and air quality indices.</li>
          <li>To send weather alert notifications to your device (only if you turn them on).</li>
          <li>To maintain your preferred application settings.</li>
        </ul>

        <h3>Weather Alerts (Optional)</h3>
        <p>Weather alerts are off unless you turn them on in Settings. Because alerts must reach your device while OrbWeather is closed, turning them on stores a small record on our server containing:</p>
        <ul>
          <li>A push subscription — an address and encryption keys your browser generates so that notifications can be delivered to this one device. It does not identify you personally.</li>
          <li>The name and coordinates of the city you chose for alerts.</li>
          <li>Your 12- or 24-hour time preference, and when you were last sent each kind of alert, so we never send duplicates.</li>
        </ul>
        <p>We do not collect your name, email address, or any account details, and we use this record for nothing except sending you weather alerts. It is kept in a database hosted by Upstash.</p>
        <p>Turning alerts off in Settings deletes the record immediately. If your browser stops accepting notifications — for example, after you uninstall the app or clear its data — the record is deleted automatically the next time we try to reach it.</p>
        <p>Notifications are delivered through your browser vendor’s push service (such as Google, Apple, Mozilla or Microsoft), which processes them in accordance with its own privacy policy.</p>

        <h3>Third-Party Services</h3>
        <p>We use Open-Meteo as our primary weather data provider. When we request weather data for your location, your IP address and coordinate data may be processed by Open-Meteo in accordance with their privacy policy.</p>

        <h3>Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. Any changes will be reflected in this document. By continuing to use the application, you consent to the updated policy.</p>
      </div>
    </div>
  );
}
