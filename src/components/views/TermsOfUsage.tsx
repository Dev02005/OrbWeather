import { Callout } from '../Callout';
import { StandaloneLayout, type PageSection } from './StandaloneLayout';

const SECTIONS: PageSection[] = [
  {
    id: 'the-service',
    title: 'The Service',
    content: (
      <p>
        OrbWeather is a free weather application that shows forecasts, air quality, sun and moon
        data and an interactive map, and can optionally send weather alert notifications. Its data
        comes from third-party providers and is offered for general information only.
      </p>
    ),
  },
  {
    id: 'forecast-accuracy',
    title: 'Forecast Accuracy',
    content: (
      <>
        <p>
          Forecasts and air quality readings are produced by computer weather models. Weather is
          inherently uncertain, and OrbWeather makes no guarantee that its data is accurate,
          complete or up to date.
        </p>
        <Callout title="Not for safety-critical decisions">
          Do not rely on OrbWeather for decisions about personal safety, severe weather or
          emergencies. Always follow the official warnings of your national or local weather
          service.
        </Callout>
      </>
    ),
  },
  {
    id: 'weather-alerts',
    title: 'Weather Alerts',
    content: (
      <p>
        Weather alerts are an optional convenience, not an emergency warning system. They are sent
        on a best-effort basis and may arrive late, arrive for conditions that do not happen, or
        not arrive at all — for example when your device is offline, in a power-saving mode, or
        has notifications blocked, or when a service they depend on is unavailable. The absence of
        an alert never means that conditions are safe.
      </p>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <>
        <p>Please use OrbWeather in a way that keeps it working for everyone. Do not:</p>
        <ul>
          <li>run automated scraping or heavy polling against the app, its alert server or its data providers;</li>
          <li>attempt to access, change or interfere with other people’s alert subscriptions;</li>
          <li>try to disrupt, overload or gain unauthorised access to any part of the service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-and-credits',
    title: 'Data Sources and Credits',
    content: (
      <>
        <p>
          OrbWeather is built on data and services run by others. We do not control them or
          guarantee their availability, and their own terms apply to your use of them.
        </p>
        <ul>
          <li>
            Weather, air quality and city search data by{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo.com</a>, licensed under{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
          </li>
          <li>
            Map data ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>, available under the Open Database License.
          </li>
          <li>
            Place names for your location by{' '}
            <a href="https://www.bigdatacloud.com" target="_blank" rel="noopener noreferrer">BigDataCloud</a>.
          </li>
          <li>Weather alerts are delivered through your browser’s push service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and Changes to the Service',
    content: (
      <p>
        We may change, suspend or discontinue any part of OrbWeather, including weather alerts, at
        any time and without notice — for example to fix problems, respond to changes by our data
        providers, or keep the service free to run.
      </p>
    ),
  },
  {
    id: 'no-warranty',
    title: 'No Warranty',
    content: (
      <p>
        OrbWeather is provided free of charge, “as is” and “as available”, without warranties of
        any kind, whether express or implied, including warranties of accuracy, reliability,
        fitness for a particular purpose and uninterrupted availability.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: (
      <p>
        To the fullest extent permitted by law, OrbWeather and the people who run it are not liable
        for any direct, indirect, incidental or consequential loss or damage arising from your use
        of, or inability to use, the application, or from your reliance on its information or
        alerts. Nothing in these terms limits any liability that cannot be limited under the law
        that applies to you.
      </p>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy',
    content: (
      <p>
        Our <a href="/privacy">Privacy Policy</a> explains what information OrbWeather uses and how
        you stay in control of it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    content: (
      <p>
        We may update these terms from time to time, and the date at the top will change when we
        do. Continuing to use OrbWeather after an update means you accept the revised terms.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:orbwheather@gmail.com">orbwheather@gmail.com</a> or visit our{' '}
        <a href="/contact">Contact page</a>.
      </p>
    ),
  },
];

export function TermsOfUsage() {
  return (
    <StandaloneLayout
      title="Terms of Usage"
      updated="September 17, 2026"
      intro={
        <p>
          These terms apply when you use OrbWeather, on the website or as an installed app. By using
          OrbWeather you agree to them; if you do not agree, please do not use it.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
