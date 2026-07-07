# OrbWeather

**Live Demo:** [https://orb-weather.vercel.app/](https://orb-weather.vercel.app/)

OrbWeather is an elite, responsive, and data-rich weather dashboard application engineered with React, TypeScript, and Vite. It provides users with highly accurate, real-time meteorological data, air quality indices, astronomical positioning, and interactive global geocoding.

## Core Features

- **Real-Time Predictive Forecasts**: Access up-to-the-minute current weather conditions alongside a highly detailed 24-hour hourly curve (with temperature and precipitation tracking) and a comprehensive 7-day weekly outlook.
- **Air Quality & Pollution Analysis**: View comprehensive breakdowns of localized air pollutants, including PM2.5, PM10, Nitrogen Dioxide (NO2), and Ozone (O3) concentration levels, sourced directly from Open-Meteo.
- **Interactive Global Radar**: An integrated Leaflet map featuring custom marker physics and reverse geocoding capabilities. Simply click anywhere on the globe to instantly pull localized weather data and identify the administrative region.
- **Astronomical Data**: Track precise sunrise, sunset, and daylight duration via an animated Sun Arc visualizer, along with dynamic Moon Phase rendering and UV Index risk assessments.
- **Global Search & Geocoding**: Search for millions of cities globally with exact administrative region identification, automatic type-ahead debouncing, and responsive dropdown suggestions.
- **Persistent Saved Locations**: Save your favorite cities into a quick-access grid within the sidebar that persists across sessions via local storage.
- **Desktop Alert System**: Opt-in to native browser notifications for severe weather conditions (e.g., thunderstorms, snow) for your active city.
- **Premium Aesthetics**: Engineered with a strict glassmorphism design language, dynamic particle backgrounds (using tsparticles) that reflect live weather conditions, and seamless light/dark mode transitions.

## Project Structure

```
OrbWeather/
├── src/
│   ├── api/            # API integration files (weather.ts, geocoding.ts)
│   ├── assets/         # Static assets (images, icons)
│   ├── components/     # Reusable UI components (HeroCard, Forecast, Sidebar)
│   │   └── views/      # Full-page views (Settings, Faq, About, RadarMap)
│   ├── utils/          # Helper functions and utilities (iconMap.ts)
│   ├── App.tsx         # Main application component and routing logic
│   ├── types.ts        # TypeScript interfaces for API responses and state
│   └── index.css       # Global CSS variables and glassmorphism utilities
├── public/             # Publicly accessible assets (favicon, manifest)
├── REQUIREMENTS.md     # Detailed system and API requirements
└── package.json        # Project dependencies and npm scripts
```

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

## Architecture and Design

The application is built with a focus on maintainability and performance. State management is handled natively via React Context and Hooks, avoiding external library bloat. User preferences, themes, and saved cities are persistently stored in browser `localStorage`. The application relies entirely on open APIs and requires no API keys for setup or execution.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information. Copyright (c) 2026 OrbWeather (Created by Praneeth Karri).
