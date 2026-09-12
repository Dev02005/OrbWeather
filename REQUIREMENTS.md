# Project Requirements

This document outlines the system requirements, dependencies, and external APIs necessary to run and build the **OrbWeather** application.

## System Requirements

- **Node.js**: 20.19 or newer (22 LTS recommended) — required by Vite 8
- **NPM**: Version 10.x or higher
- **OS**: Cross-platform (Windows, macOS, Linux)
- **Browser**: Any modern web browser (Chrome, Firefox, Safari, Edge) with ES6 module support.

## Core Dependencies

OrbWeather is built upon a modern React stack. The core libraries are defined in `package.json`:

- **React (`^19.2.7`) & React DOM**: The core UI framework.
- **Vite (`^8.1.1`)**: Next-generation frontend tooling used for local development and optimized production builds.
- **TypeScript (`~6.0.2`)**: Provides static typing across the entire application for improved developer experience and stability.
- **Leaflet (`^1.9.4`) & React-Leaflet (`^5.0.0`)**: Used to render the interactive global radar map.
- **Lucide React (`^1.23.0`)**: A comprehensive icon library used for UI iconography.
- **tsparticles (`^3.0.0`)**: Used for the dynamic, weather-responsive background animations (snow, rain, stars).
- **web-push (`^3.6.7`)**: Encrypts and signs weather alerts for the browser push services.
- **@upstash/redis (`^1.38.4`)**: Stores push subscriptions for the alert server.
- **Vitest (`^5.0.0`)**: Test runner for the unit and integration tests.

## External APIs (No Authentication Required)

The weather features rely entirely on free, open APIs that need no API keys. Only the optional
weather alerts need credentials of their own — see the next section.

1. **Open-Meteo Weather API**
   - **Endpoint**: `https://api.open-meteo.com/v1/forecast`
   - **Usage**: Provides current weather conditions, hourly forecasts (temperature, precipitation), daily forecasts (sunrise, sunset, UV index, max/min temps).

2. **Open-Meteo Air Quality API**
   - **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
   - **Usage**: Provides European AQI and granular pollutant data (PM10, PM2.5, NO2, O3).

3. **Open-Meteo Geocoding API**
   - **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
   - **Usage**: Used in the search bar for forward-geocoding (converting a city name into latitude/longitude coordinates).

4. **BigDataCloud Reverse Geocoding API (Client-side)**
   - **Endpoint**: `https://api.bigdatacloud.net/data/reverse-geocode-client`
   - **Usage**: Used to convert the user's current GPS location or map clicks back into a readable city name and region.

## Weather Alert Services (Optional)

Push alerts need three free services, configured through the environment variables listed in
`.env.example` (setup steps are in the README):

1. **Upstash Redis** — stores each subscribed device's push address and chosen city.
2. **VAPID key pair** — generated locally with `npx web-push generate-vapid-keys`; signs every alert.
3. **A scheduler** such as cron-job.org — calls `/api/check-weather` every 15 minutes.

The rest of the app works normally without them; the alerts panel simply reports that alerts
are not set up.

## Storage & Browser Requirements

- **Local Storage (`window.localStorage`)**: The app requires local storage access to persist user settings (theme, units, time format), saved favorite cities, the last viewed city, and the city chosen for weather alerts. Every stored value is validated on read.
- **Service Workers & PWA Support**: Requires modern browser support for Service Workers (`sw.js`) and Web App Manifests to enable "Add to Home Screen" installation, offline use, and push notifications. On iOS, web push
  requires iOS 16.4+ and the app being added to the Home Screen.
