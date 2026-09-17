import { StandaloneLayout, type PageSection } from './StandaloneLayout';

const SECTIONS: PageSection[] = [
  {
    id: 'information-we-use',
    title: 'Information We Use',
    content: (
      <>
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
          on your device only.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How We Use Your Information',
    content: (
      <>
        <p>Only to run OrbWeather:</p>
        <ul>
          <li>to show weather conditions, forecasts, the interactive map and air quality;</li>
          <li>to send weather alert notifications to your device, if you turn them on;</li>
          <li>to remember your settings and saved cities.</li>
        </ul>
        <p>We never sell or share your information for advertising or any other purpose.</p>
      </>
    ),
  },
  {
    id: 'weather-alerts',
    title: 'Weather Alerts (Optional)',
    content: (
      <>
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
          for nothing except sending you weather alerts.
        </p>
        <p>
          Turning alerts off in Settings deletes the record immediately. If your browser stops
          accepting notifications — for example, after you uninstall the app or clear its data —
          the record is deleted automatically the next time we try to reach it.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-services',
    title: 'Third-Party Services',
    content: (
      <>
        <p>
          To work, OrbWeather contacts the services below. Like any website, each one receives your
          IP address along with the request, and handles it under its own privacy policy.
        </p>
        <ul>
          <li><strong>Open-Meteo</strong> — weather forecasts, air quality and city search. Receives the coordinates or city name you look up.</li>
          <li><strong>BigDataCloud</strong> — turns coordinates into a city name when you use your current location or click the map. Receives those coordinates.</li>
          <li><strong>OpenStreetMap</strong> — supplies the map images for the area you view.</li>
          <li><strong>Google Fonts</strong> — supplies the typefaces the app is displayed in.</li>
          <li><strong>Vercel</strong> — hosts OrbWeather and its alert server, and processes standard request information such as IP addresses to deliver them.</li>
          <li><strong>Upstash</strong> — hosts the database that holds weather alert records.</li>
          <li><strong>Browser push services</strong> (Google, Apple, Mozilla or Microsoft, depending on your browser) — deliver weather alerts, if you turn them on.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking',
    content: (
      <p>
        OrbWeather does not use cookies, analytics, advertising identifiers or tracking pixels. The
        local storage and offline copies described above stay in your browser, are read only by
        OrbWeather to run the app, and are never used to follow you across other websites.
      </p>
    ),
  },
  {
    id: 'storage-and-security',
    title: 'Data Storage and Security',
    content: (
      <>
        <p>
          Everything described above stays on your own device, with one exception: the optional
          weather alert record, which is stored on servers in the United States. If you turn on
          alerts from another country, that record is transferred to and kept in the United States.
        </p>
        <p>
          All connections to OrbWeather and to the services it uses are encrypted with HTTPS, and
          alert notifications are encrypted so that only your browser can read them — not the push
          service that carries them. No system is perfectly secure, so we keep what we store to the
          minimum needed to run the app.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children’s Privacy',
    content: (
      <p>
        OrbWeather is a general-audience service. It never asks for a name, email address or any
        other contact details, and it does not knowingly collect personal information from
        children.
      </p>
    ),
  },
  {
    id: 'your-choices',
    title: 'Your Choices',
    content: (
      <ul>
        <li>You never have to share your location — you can search for a city instead.</li>
        <li>Turn weather alerts off at any time in Settings, which deletes their server record.</li>
        <li>Clear your browser’s site data for OrbWeather to erase everything stored on your device.</li>
      </ul>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <p>
        We may update this policy from time to time, and the date at the top will change when we
        do. Continuing to use OrbWeather after an update means you accept the revised policy.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Questions about your privacy? Email{' '}
        <a href="mailto:orbwheather@gmail.com">orbwheather@gmail.com</a> or visit our{' '}
        <a href="/contact">Contact page</a>.
      </p>
    ),
  },
];

export function PrivacyPolicy() {
  return (
    <StandaloneLayout
      title="Privacy Policy"
      updated="September 17, 2026"
      intro={
        <p>
          This policy explains what information OrbWeather uses, where it goes, and how you stay in
          control of it. In short: OrbWeather has no user accounts, shows no advertising and uses no
          analytics or tracking.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
