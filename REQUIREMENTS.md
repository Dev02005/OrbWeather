# Project Requirements

This document outlines the system requirements, dependencies, and external APIs necessary to run and build the **OrbWeather** application.

## System Requirements

- **Node.js**: Version 16.x or higher (Version 18.x or 20.x recommended)
- **NPM**: Version 8.x or higher
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

## External APIs (No Authentication Required)

OrbWeather relies entirely on free, open APIs that do not require API keys for standard usage.

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

## Storage Requirements

- **Local Storage (`window.localStorage`)**: The app requires local storage access to persist user settings (theme, units, time format, notifications toggle) and saved favorite cities. 
