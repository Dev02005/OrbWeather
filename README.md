# OrbWeather

**Live Demo:** [https://orb-weather.vercel.app/](https://orb-weather.vercel.app/)

OrbWeather is an elite, responsive, and data-rich weather dashboard application engineered with React, TypeScript, and Vite. It provides users with highly accurate, real-time meteorological data, air quality indices, astronomical positioning, and interactive global geocoding.

## Core Features

- **Real-Time Predictive Forecasts**: Access up-to-the-minute current weather conditions alongside a highly detailed 24-hour hourly curve (with temperature and precipitation tracking) and a comprehensive 7-day weekly outlook.
- **Air Quality & Pollution Analysis**: View comprehensive breakdowns of localized air pollutants, including PM2.5, PM10, Nitrogen Dioxide (NO2), and Ozone (O3) concentration levels, sourced directly from Open-Meteo.
- **Interactive Global Radar**: An integrated Leaflet map featuring custom marker physics and reverse geocoding capabilities. Simply click anywhere on the globe to instantly pull localized weather data and identify the administrative region.
- **Custom Notification System**: A built-in, glassmorphic toast notification system that smoothly alerts you to severe weather warnings, settings changes, and saved locations without relying on clunky native browser popups.
- **Advanced Map Markers**: Interactive map markers that intelligently differentiate between your physical location (pulsing blue dot) and searched cities (custom glassmorphic pin).
- **Responsive Fluid Layout**: Engineered with CSS Grid auto-fit and fluid typography (`clamp`) to look stunning on tiny mobile screens, iPads, and ultra-wide 4K displays alike.
- **Global Search & Geocoding**: Search for millions of cities globally with exact administrative region identification, automatic type-ahead debouncing, and responsive dropdown suggestions.
- **Persistent Saved Locations**: Save your favorite cities into a quick-access grid within the sidebar that persists across sessions via local storage.
- **Alert System**: Opt-in to beautiful, glassmorphic in-app toast notifications for severe weather conditions (e.g., thunderstorms, snow) for your active city.
- **Premium Aesthetics**: Engineered with a strict glassmorphism design language, dynamic particle backgrounds (using tsparticles) that reflect live weather conditions, and seamless light/dark mode transitions.

## Project Structure

```
OrbWeather/
├── api/                # Serverless functions for push alerts (see below)
│   └── _lib/           # Alert rules, storage, validation (+ tests)
├── src/
│   ├── api/            # Open-Meteo + BigDataCloud clients (typed, abortable)
│   ├── components/     # UI components (HeroCard, Forecast, Sidebar, ...)
│   │   └── views/      # Full-page views (Settings, Faq, About, RadarMap)
│   ├── contexts/       # Toast provider and its hook
│   ├── hooks/          # useRoute — History-API routing + document metadata
│   ├── utils/          # time, forecast, storage, iconMap (+ colocated tests)
│   ├── routes.ts       # Single route table, shared with the prerender step
│   ├── App.tsx         # Dashboard shell and app state
│   ├── main.tsx        # Entry point, error boundary, SW registration
│   ├── types.ts        # API response and state interfaces
│   └── index.css       # Global CSS variables and glassmorphism utilities
├── scripts/
│   └── prerender.mjs   # Emits per-route HTML + sitemap.xml after the build
├── public/             # Icons, manifest, sw.js, robots.txt, social card
└── package.json
```

### Working with timezones

Open-Meteo is queried with `timezone: 'auto'`, so every timestamp it returns is
the *selected city's* wall clock and carries no UTC offset. Passing one of those
strings to `new Date()` reads it in the **browser's** timezone, which silently
skews results whenever the viewer isn't sitting in the city they're looking at.
`src/utils/time.ts` holds the helpers for this — `cityNow`, `wallClockMs` and
`formatWallClockTime`. Prefer them over `Date` parsing anywhere API timestamps
are compared or displayed.

## Technology Stack

- **Frontend Framework**: React (Hooks-based architecture)
- **Language**: TypeScript (Strict typing for robust scalability)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid)
- **Iconography**: Lucide React
- **Mapping Engine**: React-Leaflet
- **Data Providers**: Open-Meteo API (Weather & AQI), BigDataCloud API (Reverse Geocoding)

## Installation & Setup

### Prerequisites

Ensure you have Node.js (version 16 or higher) installed on your system.

### Development Environment

1. Clone the repository to your local machine.
2. Navigate into the project directory:
   ```bash
   cd OrbWeather
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the local Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173` to view the application.

### Production Build

To create an optimized, production-ready bundle:
```bash
npm run build
```
The minified and chunked files will be generated in the `dist` directory, ready for deployment to Vercel, Netlify, or any static hosting service.

## Routing and SEO

Routes live in one table (`src/routes.ts`) that is read twice: at runtime by
`useRoute` (a small History-API router — the app has a handful of static routes
and no dynamic segments, so it does not need a routing library), and at build
time by `scripts/prerender.mjs`.

That script writes a real HTML file per route with the correct `<title>`,
description and canonical baked in, and regenerates `sitemap.xml` so it can
never drift from the table. This matters because social crawlers — Facebook,
LinkedIn, Slack — do not execute JavaScript: without prerendering every shared
link previews as the homepage, no matter what the client-side code sets.

Adding a route means adding one entry to `ROUTES`; the router, the metadata,
the prerendered page and the sitemap all follow from it.

## Testing

```bash
npm test          # single run
npm run test:watch
```

Vitest covers the pure logic most likely to break subtly — timezone handling,
forecast day/night derivation, `localStorage` validation and route matching.
The timezone specs run assertions under several `TZ` values (including
`America/Los_Angeles` and `Pacific/Kiritimati`), which is what pins down the
class of bug where a date-only string parses as UTC midnight and shifts the
weekday for every viewer west of UTC.

## Progressive Web App

OrbWeather registers a service worker in production builds (`public/sw.js`) and
ships a full web app manifest, so it can be installed to a home screen and
launched standalone. Caching is deliberately conservative:

- **Navigations** — network-first, falling back to the cached app shell offline.
- **Built assets** — cache-first; Vite fingerprints them so they never go stale.
- **Weather APIs** — network-first, falling back to the last successful response,
  so an offline launch shows the most recent readings rather than an error.

Bump `CACHE_VERSION` in `public/sw.js` to retire every previous cache at once.

## Weather Alerts (Web Push)

OrbWeather can notify a device about incoming bad weather even while the app is
closed. The browser cannot do this alone — something has to check the forecast
while the phone sleeps — so a few small serverless functions live in `/api`:

```
Phone ──subscribe──► /api/subscribe ──► Upstash Redis (endpoint + city)
cron-job.org ──every 15 min──► /api/check-weather
    └─ reads subscriptions ─► Open-Meteo per place ─► alert rules ─► Web Push
Browser push service (Google / Apple / Mozilla) ──► service worker ──► notification
```

**What triggers an alert** (`api/_lib/alerts.ts`): a thunderstorm, heavy rain or
snow, or freezing rain now or within two hours; or a 70%+ chance of rain within
two hours when it is currently dry. Each kind is sent at most once every six
hours per device, and severe weather suppresses the separate rain alert.

**Everything runs on free tiers.** Push delivery is free from the browser
vendors; Vercel Hobby runs the functions; Upstash's free Redis stores
subscriptions; cron-job.org provides the schedule (Vercel Hobby's own cron only
runs daily). Each check fetches every watched place once, however many devices
share it.

### Setup

1. **Keys.** Copy `.env.example` to `.env.local` and fill it in. Generate the
   VAPID pair with `npx web-push generate-vapid-keys`, and use any long random
   string for `CRON_SECRET`.
2. **Database.** Create a free Redis database at [upstash.com](https://upstash.com)
   and copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from its
   REST API section.
3. **Vercel.** Add all five variables under *Project → Settings → Environment
   Variables*, then redeploy — variables only apply to new deployments.
4. **Schedule.** Create a job at [cron-job.org](https://cron-job.org) that calls
   `https://<your-domain>/api/check-weather` every 15 minutes, with the header
   `Authorization: Bearer <CRON_SECRET>`. (If a scheduler cannot set headers,
   `?key=<CRON_SECRET>` works too.) Its run history shows each check's summary.

On iPhone and iPad, Web Push only exists for sites added to the Home Screen
(iOS 16.4+); the Settings screen detects this and shows the install steps.

### Endpoints

| Route | Purpose |
|---|---|
| `GET /api/push-key` | Public VAPID key the page subscribes with |
| `POST /api/subscribe` | Create or refresh a device's subscription |
| `POST /api/unsubscribe` | Delete it |
| `POST /api/test-push` | Send a confirmation notification (rate-limited) |
| `GET /api/check-weather` | The scheduled check; requires `CRON_SECRET` |

Subscription endpoints are accepted only from known push-service hosts, so the
server can never be pointed at an arbitrary URL. Total subscriptions are capped
at 500 to stay inside free-tier limits.

## Accessibility

- City search is a full WAI-ARIA combobox: arrow keys move through results,
  Enter selects the highlighted one, Escape dismisses the list.
- A skip link, labelled landmarks and a single `h1` → `h2` heading outline make
  the dashboard navigable by screen reader.
- Every icon-only control carries an `aria-label`; decorative icons are hidden.
- Toasts announce through a polite live region, with alerts raised to assertive.
- One consistent `:focus-visible` ring, and `prefers-reduced-motion` is honoured.
- A top-level error boundary keeps a render failure from blanking the page.

## Architecture and Design

State is handled natively with React hooks and one context, avoiding external
library bloat. The app relies entirely on open APIs and needs no keys to run.

A few conventions worth knowing before changing things:

- **`localStorage` is never trusted.** It is user-writable and outlives app
  versions, so `src/utils/storage.ts` validates every read and falls back rather
  than casting. It also swallows access errors, which private-browsing modes
  throw.
- **Weather requests are abortable.** `loadWeather` cancels the previous request
  before starting a new one, so a slow response for an earlier city can never
  overwrite a newer one.
- **Leaflet and tsparticles load lazily.** They are the two heaviest
  dependencies and neither is needed for the first paint, which keeps the
  initial bundle at roughly half what it would otherwise be.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information. Copyright (c) 2026 OrbWeather (Created by Praneeth Karri).
