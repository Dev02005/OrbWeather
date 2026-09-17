import { BellRing, CalendarDays, Check, Download, Map, Search, SlidersHorizontal, Sunrise, Wind } from 'lucide-react';
import { Callout } from '../Callout';
import './Views.css';

const HIGHLIGHTS = ['Free', 'No account', 'No ads', 'Works offline'];

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Forecasts',
    text: 'Current conditions, a 24-hour hourly strip and a 7-day outlook you can expand hour by hour.',
  },
  {
    icon: Map,
    title: 'Interactive map',
    text: 'Click anywhere in the world to see the weather at that exact spot.',
  },
  {
    icon: Wind,
    title: 'Air quality',
    text: 'The European Air Quality Index, with PM2.5, PM10, ozone, nitrogen dioxide, sulphur dioxide and carbon monoxide.',
  },
  {
    icon: Sunrise,
    title: 'Sun and moon',
    text: 'Sunrise and sunset, a live daylight arc, the UV index and the moon phase.',
  },
  {
    icon: Search,
    title: 'Search and saved cities',
    text: 'Find any place worldwide and keep your favourites one tap away.',
  },
  {
    icon: BellRing,
    title: 'Weather alerts',
    text: 'Optional notifications for storms, heavy rain or snow, and rain on its way — even when the app is closed.',
  },
  {
    icon: Download,
    title: 'Install and offline',
    text: 'Add OrbWeather to your home screen from Settings. It opens with your latest forecast, even without a connection.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Your preferences',
    text: 'Light or dark theme, Celsius or Fahrenheit, 12- or 24-hour time — remembered on your device.',
  },
];

const SOURCES = [
  {
    name: 'Open-Meteo',
    href: 'https://open-meteo.com',
    role: 'Forecasts, air quality and city search, combining leading national weather models.',
    credit: 'Licensed under CC BY 4.0',
  },
  {
    name: 'BigDataCloud',
    href: 'https://www.bigdatacloud.com',
    role: 'Turns your coordinates into a city name when you use your current location or click the map.',
  },
  {
    name: 'OpenStreetMap',
    href: 'https://www.openstreetmap.org/copyright',
    role: 'The map, drawn from data by OpenStreetMap contributors.',
    credit: 'Available under the Open Database License',
  },
];

export function About() {
  return (
    <div className="view-container animate-fade-up">
      <header className="about-hero">
        <img src="/icon-192.png" alt="" width={72} height={72} className="about-hero-icon" />
        <div>
          <h1>About OrbWeather</h1>
          <p className="about-tagline">
            Clear, reliable weather for anywhere in the world — in one calm, private dashboard.
          </p>
        </div>
      </header>

      <ul className="about-highlights" aria-label="At a glance">
        {HIGHLIGHTS.map(highlight => (
          <li key={highlight}>
            <Check size={14} aria-hidden="true" />
            {highlight}
          </li>
        ))}
      </ul>

      <div className="view-content">
        <p>
          OrbWeather brings current conditions, forecasts, air quality and sun and moon data for any
          city into one clear screen. There is nothing to sign up for, no advertising and no
          tracking — your settings and saved cities stay on your device.
        </p>

        <section aria-labelledby="about-features-title">
          <h2 id="about-features-title" className="about-section-title">What You Can Do</h2>
          <ul className="about-grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="about-card">
                <span className="about-card-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-sources-title">
          <h2 id="about-sources-title" className="about-section-title">Where the Data Comes From</h2>
          <ul className="about-grid about-sources">
            {SOURCES.map(source => (
              <li key={source.name} className="about-card">
                <h3>
                  <a href={source.href} target="_blank" rel="noopener noreferrer">{source.name}</a>
                </h3>
                <p>{source.role}</p>
                {source.credit && <p className="about-credit">{source.credit}</p>}
              </li>
            ))}
          </ul>
        </section>

        <Callout title="Forecasts are predictions">
          Forecasts, air quality readings and alerts come from weather models and can be wrong. For
          decisions about safety, always follow your local weather service’s official warnings.
        </Callout>

        <nav className="about-links" aria-label="Legal and contact">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Usage</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </div>
    </div>
  );
}
