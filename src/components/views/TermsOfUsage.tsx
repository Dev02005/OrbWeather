import './Standalone.css';

export function TermsOfUsage() {
  return (
    <div className="standalone-container">
      <h1 className="standalone-title">Terms of Usage</h1>
      <div className="standalone-content">
        <p className="standalone-updated">Last updated: September 13, 2026</p>

        <p>
          By using OrbWeather — on the website or as an installed app — you agree to these Terms of
          Usage. If you do not agree with them, please do not use the application.
        </p>

        <h2>1. The Service</h2>
        <p>
          OrbWeather is a free weather application that shows forecasts, air quality, sun and moon
          data and an interactive map, and can optionally send weather alert notifications. Its data
          comes from third-party providers and is offered for general information only.
        </p>

        <h2>2. Forecast Accuracy</h2>
        <p>
          Forecasts and air quality readings are produced by computer weather models. Weather is
          inherently uncertain, and{' '}
          <strong>
            OrbWeather makes no guarantee that its data is accurate, complete or up to date.
          </strong>
        </p>

        <div className="notice">
          <strong>Safety warning:</strong> do not rely on OrbWeather for decisions about personal
          safety, severe weather or emergencies. Always follow the official warnings of your
          national or local weather service.
        </div>

        <h2>3. Weather Alerts</h2>
        <p>
          Weather alerts are an optional convenience, not an emergency warning system. They are sent
          on a best-effort basis and may arrive late, arrive for conditions that do not happen, or
          not arrive at all — for example when your device is offline, in a power-saving mode, or
          has notifications blocked, or when a service they depend on is unavailable. The absence of
          an alert never means that conditions are safe.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>
          Do not use OrbWeather in a way that damages the service or disrupts it for others. In
          particular, do not run automated scraping or heavy polling against the application, its
          alert server, or its data providers, and do not attempt to access or interfere with
          other people’s alert subscriptions.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
          OrbWeather depends on services run by others, including Open-Meteo, BigDataCloud,
          OpenStreetMap and your browser’s push service. We do not control them, cannot guarantee
          their availability, and their own terms apply to your use of them.
        </p>

        <h2>6. No Warranty</h2>
        <p>
          OrbWeather is provided free of charge, “as is” and “as available”, without warranties of
          any kind. To the fullest extent the law allows, we are not liable for any loss or damage
          arising from your use of the application or your reliance on its information.
        </p>

        <h2>7. Changes to These Terms</h2>
        <p>
          We may update these terms from time to time, and the date at the top will change when we
          do. Continuing to use OrbWeather after an update means you accept the revised terms.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about these terms? <a href="/contact">Contact us</a>.
        </p>
      </div>
    </div>
  );
}
