# OrbWeather

**Live Demo:** [https://orb-weather.vercel.app/](https://orb-weather.vercel.app/)

OrbWeather is a responsive, installable weather dashboard built with React, TypeScript and Vite. It shows up-to-date forecasts, air quality, sun and moon data and an interactive world map for any city, and can send weather alerts to your phone — with no account, no advertising and no tracking.

## Core Features

- **Forecasts**: Current conditions, a scrollable 24-hour strip with temperature and chance of rain for each hour, and a 7-day outlook where any day expands into its own hourly view. Day and night icons follow each hour's actual sunrise and sunset.
- **Air Quality & Pollution Analysis**: The European Air Quality Index with a breakdown of PM2.5, PM10, carbon monoxide (CO), nitrogen dioxide (NO₂), ozone (O₃) and sulphur dioxide (SO₂), sourced from Open-Meteo.
- **Interactive World Map**: A Leaflet map on OpenStreetMap tiles with reverse geocoding. Click anywhere on the globe to pull that spot's weather and identify its region. (It is a location picker, not a precipitation radar.)
- **In-App Messages**: Glass-style toasts confirm settings changes, saved locations and errors without browser popups, and are announced to screen readers.
- **Map Markers**: Your own location shows as a pulsing blue dot, and a searched or clicked city as a glass-style pin, so the two are never confused.
- **Responsive Layout**: CSS Grid `auto-fit` and fluid `clamp()` sizing adapt the dashboard from small phones through tablets to wide desktop screens.
- **Global Search**: Type-ahead city search worldwide, showing each result's region and country so places that share a name are easy to tell apart. Fully keyboard-operable.
- **Saved Locations**: Save favourite cities to a list in the sidebar, remembered between visits in local storage, with their live conditions shown on the dashboard.
- **Weather Alerts**: Opt-in push notifications on phones and computers — delivered even when the app is closed — for thunderstorms, heavy rain or snow, and rain arriving within two hours.
- **Installable & Offline**: Install from the landing page or at any time from **Settings → Install App**. Installed or not, it opens offline with the most recent forecast it loaded.
- **Design**: A glassmorphism look with light and dark themes, and an animated CSS weather layer that rains, snows or drifts to match live conditions.

## Project Structure

```
OrbWeather/
├── api/                # Serverless functions for push alerts (see below)
│   └── _lib/           # Alert rules, storage, validation (+ tests)
├── src/
│   ├── services/       # Open-Meteo + BigDataCloud clients (typed, abortable)
│   ├── components/     # UI components (HeroCard, Forecast, Sidebar, ...)
│   │   └── views/      # Full-page views (Settings, Faq, About, RadarMap) and the
│   │                   #   Privacy, Terms and Contact pages with their shared layout
│   ├── contexts/       # Toast provider and its hook
│   ├── hooks/          # useRoute (routing + metadata), useInstallPrompt (install flow)
│   ├── utils/          # location, city, time, forecast, precipitation, storage, push, platform, iconMap (+ tests)
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
- **Alerts Backend**: Vercel Serverless Functions, Upstash Redis, Web Push (VAPID)
- **Testing**: Vitest

## Installation & Setup

### Prerequisites

Ensure you have Node.js 20.19 or newer (22 LTS recommended) installed on your system.

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

Vitest covers the logic most likely to break subtly. On the client: timezone
handling, forecast day/night derivation, `localStorage` validation, platform
detection and route matching. On the alert server: the alert rules and their
cooldowns, input validation, every endpoint, and a real Web Push round trip —
a payload encrypted by the server is decrypted as a subscribed browser would.

GitHub Actions (`.github/workflows/ci.yml`) runs the linter, the tests and a
full build on every push and pull request.
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

Chromium fires its install event (`beforeinstallprompt`) once and early, so
`src/hooks/useInstallPrompt.ts` captures it as soon as the app loads rather than
inside a component. Both the landing-page popup and **Settings → Install App**
read from it; Safari, Firefox and iOS, which have no install event, get
step-by-step instructions instead, and a device already running installed sees
a confirmation rather than a button.

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
- One consistent `:focus-visible` ring. Under `prefers-reduced-motion`, interface
  animations are cut short; the decorative weather background always animates.
- Settings choices are grouped buttons with `aria-pressed`, so the selected
  option is announced, and filled buttons use a deeper blue so white text meets
  WCAG AA contrast.
- FAQ questions are real buttons inside headings, so they open from the keyboard
  and announce whether they are expanded.
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
- **Leaflet loads lazily.** The map is the heaviest dependency and is not
  needed for the first paint, which keeps the initial bundle far smaller.
- **The weather background is pure CSS.** Rain, snow and drifting motes are
  animated with `transform` alone, so the browser runs them on the compositor.
  It replaced a canvas particle library that cost ~145 kB of JavaScript.
- **The background always animates.** The global reduced-motion rule in
  `index.css` excludes the weather drops, so they keep moving while every other
  interface animation respects the device setting.
- **Content pages use CSS classes, not inline styles.** About, FAQ and the policy
  pages share `Views.css` and `Standalone.css`, so both themes apply to them.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information. Copyright (c) 2026 OrbWeather.
