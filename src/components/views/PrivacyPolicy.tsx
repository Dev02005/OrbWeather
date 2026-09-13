import './Standalone.css';

export function PrivacyPolicy() {
  return (
    <div className="standalone-container">
      <h1 className="standalone-title">Privacy Policy</h1>
      <div className="standalone-content">
        <p className="standalone-updated">Last updated: September 13, 2026</p>

        <p>
          Your privacy matters to us. This policy explains what information OrbWeather uses, where
          it goes, and how you stay in control of it. OrbWeather has no user accounts, shows no
          advertising and uses no analytics or tracking scripts.
        </p>

        <h2>Information We Use</h2>
        <p>
          <strong>Location:</strong> if you choose to use your current location, your browser
          shares your coordinates with OrbWeather. They are used to fetch the weather for that
          place and to look up its city name, as described under Third-Party Services. We do not
          store your location on any server we control, unless you turn on weather alerts.
        </p>
        <p>
          <strong>Cities you search for or save:</strong> sent to our weather provider to fetch
          forecasts, and otherwise kept only on your device.
        </p>
        <p>
          <strong>Preferences:</strong> your theme, temperature unit, time format, saved cities and
          last viewed city are stored in your browser’s local storage, on your device only, so they
          are remembered next time without an account.
        </p>
        <p>
          <strong>Offline copies:</strong> to keep working without a connection, OrbWeather saves a
          copy of the app and of the most recent forecasts it loaded in your browser’s cache, again
          on your device only. Clearing your browser’s site data removes them.
        </p>

        <h2>How We Use Your Information</h2>
        <p>Only to run OrbWeather:</p>
        <ul>
          <li>to show weather conditions, forecasts, the interactive map and air quality;</li>
          <li>to send weather alert notifications to your device, if you turn them on;</li>
          <li>to remember your settings and saved cities.</li>
        </ul>
        <p>We never sell or share your information for advertising or any other purpose.</p>

        <h2>Weather Alerts (Optional)</h2>
        <p>
          Weather alerts are off unless you turn them on in Settings. Because alerts must reach your
          device while OrbWeather is closed, turning them on stores a small record on our server
          containing:
        </p>
        <ul>
          <li>
            A push subscription — an address and encryption keys your browser generates so that
            notifications can be delivered to this one device. It does not identify you personally.
          </li>
          <li>The name and coordinates of the city you chose for alerts.</li>
          <li>
            Your 12- or 24-hour time preference, and when you were last sent each kind of alert, so
            we never send duplicates.
          </li>
        </ul>
        <p>
          We do not collect your name, email address or any account details, and we use this record
          for nothing except sending you weather alerts. It is kept in a database hosted by Upstash.
        </p>
        <p>
          Turning alerts off in Settings deletes the record immediately. If your browser stops
          accepting notifications — for example, after you uninstall the app or clear its data —
          the record is deleted automatically the next time we try to reach it.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          To work, OrbWeather contacts the services below directly from your browser. Like any
          website, each one receives your IP address along with the request, and handles it under
          its own privacy policy.
        </p>
        <ul>
          <li><strong>Open-Meteo</strong> — weather forecasts, air quality and city search. Receives the coordinates or city name you look up.</li>
          <li><strong>BigDataCloud</strong> — turns coordinates into a city name when you use your current location or click the map. Receives those coordinates.</li>
          <li><strong>OpenStreetMap</strong> — supplies the map images for the area you view.</li>
          <li><strong>Google Fonts</strong> — supplies the typefaces the app is displayed in.</li>
          <li><strong>Vercel</strong> — hosts OrbWeather and its alert server, and processes standard request information such as IP addresses to deliver them.</li>
          <li><strong>Browser push services</strong> (Google, Apple, Mozilla or Microsoft, depending on your browser) — deliver weather alerts, if you turn them on.</li>
        </ul>

        <h2>Your Choices</h2>
        <ul>
          <li>You never have to share your location — you can search for a city instead.</li>
          <li>Turn weather alerts off at any time in Settings, which deletes their server record.</li>
          <li>Clear your browser’s data for OrbWeather to erase everything stored on your device.</li>
        </ul>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy from time to time, and the date at the top will change when we
          do. Continuing to use OrbWeather after an update means you accept the revised policy.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about your privacy? <a href="/contact">Contact us</a>.
        </p>
      </div>
    </div>
  );
}
