import './Views.css';

export function About() {
  return (
    <div className="view-container animate-fade-up">
      <div className="view-header">
        <h1>About OrbWeather</h1>
      </div>
      <div className="view-content">
        <p>
          <strong>OrbWeather</strong> is a free weather dashboard. It
          brings current conditions, forecasts, air quality and sun and moon data for any city into
          one clear screen — with no account, no advertising and no tracking.
        </p>

        <h2 className="about-heading">Key Features</h2>
        <ul className="about-features">
          <li><strong>Forecasts:</strong> current conditions, a 24-hour hourly strip and a 7-day outlook you can expand hour by hour.</li>
          <li><strong>Interactive map:</strong> click anywhere in the world to see the weather at that exact spot.</li>
          <li><strong>Air quality:</strong> the European Air Quality Index with PM2.5, PM10, ozone, nitrogen dioxide, sulphur dioxide and carbon monoxide.</li>
          <li><strong>Sun and moon:</strong> sunrise and sunset, a live daylight arc, the UV index and the moon phase.</li>
          <li><strong>Search and saved cities:</strong> find any place worldwide and keep your favourites one tap away.</li>
          <li><strong>Weather alerts:</strong> optional notifications on your phone or computer — even when the app is closed — for storms, heavy rain or snow, and rain on its way.</li>
          <li><strong>Install and offline:</strong> add OrbWeather to your home screen from Settings, and it opens like an app with your latest forecast even without a connection.</li>
        </ul>

        <h2 className="about-heading">Where the Data Comes From</h2>
        <p>
          Forecasts, air quality and city search come from{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a>,
          which combines leading national weather models. When you use your current location,{' '}
          <a href="https://www.bigdatacloud.com" target="_blank" rel="noopener noreferrer">BigDataCloud</a>{' '}
          turns your coordinates into a city name, and the map is drawn with{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>{' '}
          data.
        </p>

        <div className="notice">
          <strong>Caution:</strong> forecasts, air quality readings and alerts are model-based
          predictions, not certainties. Do not rely on OrbWeather alone for decisions about safety
          — always follow your local weather authority’s official warnings.
        </div>

        <hr className="about-divider" />

        <nav className="about-links" aria-label="Legal and contact">
          <a href="/privacy" className="setting-btn">Privacy Policy</a>
          <a href="/terms" className="setting-btn">Terms of Usage</a>
          <a href="/contact" className="setting-btn">Contact Us</a>
        </nav>
      </div>
    </div>
  );
}
