import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import './Views.css';

interface FaqItemProps {
  question: string;
  children: ReactNode;
}

/**
 * One question. The question is a real button inside a heading, so it opens
 * from the keyboard, screen readers announce whether it is expanded, and the
 * questions still form a navigable list of headings.
 */
function FaqItem({ question, children }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const answerId = useId();

  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <h2 className="faq-question">
        <button
          type="button"
          className="faq-toggle"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => setOpen(isOpen => !isOpen)}
        >
          {question}
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </h2>
      <div id={answerId} className="faq-answer" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <div className="view-container animate-fade-up">
      <div className="view-header">
        <h1>Frequently Asked Questions</h1>
      </div>
      <div className="view-content">
        <div className="faq-list">
          <FaqItem question="How often is the data updated?">
            Weather and air quality come from Open-Meteo, which refreshes current conditions every
            15 minutes and publishes new forecasts as fresh model runs arrive, roughly every hour.
            While OrbWeather is open on your screen, it reloads your city’s data every 15 minutes.
          </FaqItem>

          <FaqItem question="Can I search for any city?">
            Yes. The search box looks up places anywhere in the world as you type, including the
            region or state, so towns that share a name are easy to tell apart. You can also click
            any point on the <strong>Weather Map</strong> to see the weather there.
          </FaqItem>

          <FaqItem question="How accurate are the predictions?">
            Forecasts come from advanced global weather models such as GFS and ECMWF. They are
            predictions, not guarantees, and real conditions can differ — especially for storms and
            showers. <strong>Always follow your local weather authority for severe weather
            warnings.</strong>
          </FaqItem>

          <FaqItem question="Why does my current location show a different city?">
            Computers without GPS let the browser estimate your position from your internet
            connection. Providers often route traffic through a regional hub, so your location can
            appear as that hub’s city. Searching for your city by name fixes it.
          </FaqItem>

          <FaqItem question="Can I install OrbWeather as an app?">
            Yes — no app store needed. Use the <strong>Install App</strong> button on the welcome
            screen, or install at any time from <strong>Settings → Install App</strong>. On iPhone
            and iPad, tap Safari’s <strong>Share</strong> button and choose <strong>Add to Home
            Screen</strong>. Once installed, it opens like a normal app and still shows your most
            recent forecast when you are offline.
          </FaqItem>

          <FaqItem question="How do weather alerts work?">
            Turn them on in <strong>Settings → Weather Alerts</strong>. Every 15 minutes OrbWeather
            checks the forecast for your chosen city and sends a notification to your phone or
            computer — even when the app is closed — if a thunderstorm, heavy rain or snow, or rain
            is on its way within two hours. You get at most one alert of each kind every six hours.
            On iPhone and iPad, install OrbWeather to your Home Screen first; that is Apple’s
            requirement for web notifications. Alerts are a helpful extra, not an emergency warning
            service.
          </FaqItem>

          <FaqItem question="Why isn’t the rain or snow in the background moving?">
            OrbWeather follows your device’s <em>reduce motion</em> setting. When it is on, the
            background still shows the weather, but holds still instead of animating. To see it
            move, turn animations back on:
            <ul>
              <li><strong>Windows:</strong> Settings → Accessibility → Visual effects → Animation effects (on)</li>
              <li><strong>Mac:</strong> System Settings → Accessibility → Display → Reduce motion (off)</li>
              <li><strong>iPhone and iPad:</strong> Settings → Accessibility → Motion → Reduce Motion (off)</li>
              <li><strong>Android:</strong> Settings → Accessibility → Remove animations (off)</li>
            </ul>
          </FaqItem>

          <FaqItem question="Are my saved cities private?">
            Yes. Your saved cities, settings and preferences are stored only on your own device, and
            we never track you. The single exception is weather alerts, which are off unless you
            turn them on: to reach your device while the app is closed, they store the city you
            chose and an anonymous notification address on our server. Turning alerts off deletes
            that record. See the <a href="/privacy">Privacy Policy</a> for details.
          </FaqItem>

          <FaqItem question="Is OrbWeather free?">
            Yes, completely. There is no account to create, no advertising and no subscription.
          </FaqItem>
        </div>
      </div>
    </div>
  );
}
