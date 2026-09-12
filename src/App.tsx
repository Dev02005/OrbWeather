import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Menu, Search, MapPin } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { HeroCard } from './components/HeroCard';
import { StatsRow } from './components/StatsRow';
import { Forecast } from './components/Forecast';
import { AirQuality } from './components/AirQuality';
import { WorldCities } from './components/WorldCities';
import { Settings } from './components/views/Settings';
import { Faq } from './components/views/Faq';
import { About } from './components/views/About';
import { LandingPage } from './components/views/LandingPage';
import { LocationPromptModal } from './components/LocationPromptModal';
import { UvMoonCard } from './components/UvMoonCard';
import { SunArc } from './components/SunArc';
import { WeatherBackground } from './components/WeatherBackground';
import { fetchWeather, isAbortError } from './services/weather';
import { reverseGeocode } from './services/geocoding';
import { useToast } from './contexts/toast-context';
import { useRoute, applyRouteMeta } from './hooks/useRoute';
import { STORAGE_KEYS, readEnum, readBoolean, readCity, readCityList, write } from './utils/storage';
import { isStandalone } from './utils/platform';
import { syncAlerts } from './utils/push';
import type { CityMeta, WeatherData, AirQualityData } from './types';
import './App.css';

// Leaflet is the heaviest dependency and is not needed for the first paint,
// so the map loads on demand rather than in the main bundle.
const RadarMap = lazy(() =>
  import('./components/views/RadarMap').then(m => ({ default: m.RadarMap }))
);

const THEMES = ['light', 'dark'] as const;
const UNITS = ['celsius', 'fahrenheit'] as const;
const TIME_FORMATS = ['12h', '24h'] as const;

const FALLBACK_CITY: CityMeta = {
  name: 'London',
  countryCode: 'GB',
  country: 'United Kingdom',
  lat: 51.5074,
  lon: -0.1278,
};

/** How often an open, visible dashboard refreshes its data. */
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const GEO_OPTIONS: PositionOptions = { timeout: 10_000, enableHighAccuracy: true };

function App() {
  const { route, navigate } = useRoute();
  const activeView = route.view;

  const [hasStarted, setHasStarted] = useState(
    () => isStandalone() || readBoolean(STORAGE_KEYS.started)
  );

  const [theme, setTheme] = useState(() => readEnum(STORAGE_KEYS.theme, THEMES, 'light'));
  const [unit, setUnit] = useState(() => readEnum(STORAGE_KEYS.unit, UNITS, 'celsius'));
  const [timeFormat, setTimeFormat] = useState(() =>
    readEnum(STORAGE_KEYS.timeFormat, TIME_FORMATS, '12h')
  );

  const [currentCity, setCurrentCity] = useState<CityMeta | null>(null);
  const [savedCities, setSavedCities] = useState<CityMeta[]>(() =>
    readCityList(STORAGE_KEYS.saved)
  );

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aq, setAq] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const { showToast } = useToast();
  const inFlight = useRef<AbortController | null>(null);

  /**
   * Every load goes through here. The previous request is aborted first, so a
   * slow earlier response can never overwrite a newer city's data.
   */
  const loadWeather = useCallback(
    async (city: CityMeta, currentUnit: 'celsius' | 'fahrenheit') => {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(
          { lat: city.lat, lon: city.lon },
          currentUnit,
          controller.signal
        );
        setWeather(data.weather);
        setAq(data.aq);
        write(STORAGE_KEYS.lastCity, JSON.stringify(city));
      } catch (err) {
        if (isAbortError(err)) return; // superseded by a newer request
        console.error('Weather request failed:', err);
        setError('Failed to load weather data.');
      } finally {
        if (inFlight.current === controller) {
          inFlight.current = null;
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => () => inFlight.current?.abort(), []);

  useEffect(() => {
    write(STORAGE_KEYS.theme, theme);
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    write(STORAGE_KEYS.unit, unit);
    if (currentCity) loadWeather(currentCity, unit);
    // currentCity is deliberately omitted: selecting a city already loads it,
    // and including it here would double-fetch on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, loadWeather]);

  useEffect(() => {
    write(STORAGE_KEYS.timeFormat, timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    write(STORAGE_KEYS.saved, JSON.stringify(savedCities));
  }, [savedCities]);

  // Keep document metadata in step with the route, so shared links and browser
  // history describe what is actually on screen.
  useEffect(() => {
    const onDashboard = activeView === 'dashboard';
    applyRouteMeta(
      route,
      onDashboard && currentCity && weather
        ? {
            title: `${Math.round(weather.current.temperature_2m)}°${unit === 'celsius' ? 'C' : 'F'} in ${currentCity.name} — OrbWeather`,
            description: `Current conditions, hourly and 7-day forecast, and air quality for ${currentCity.name}${currentCity.country ? `, ${currentCity.country}` : ''}.`,
          }
        : undefined
    );
  }, [route, activeView, currentCity, weather, unit]);

  // Keep an open dashboard current. Hidden tabs are skipped — push alerts cover
  // the time the app is not being looked at.
  useEffect(() => {
    if (!currentCity) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadWeather(currentCity, unit);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentCity, unit, loadWeather]);

  // Re-register this device's alert subscription on launch and whenever the
  // 12/24-hour preference used in alert messages changes.
  useEffect(() => {
    if (import.meta.env.PROD) syncAlerts(timeFormat).catch(() => undefined);
  }, [timeFormat]);

  // Restore the last city, or ask for location if there is none.
  useEffect(() => {
    const lastCity = readCity(STORAGE_KEYS.lastCity);
    if (lastCity) {
      setCurrentCity(lastCity);
      loadWeather(lastCity, unit);
      return;
    }
    setShowLocationPrompt(true);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Resolves to the detected city, or null if permission or lookup failed. */
  const detectLocation = useCallback(
    () =>
      new Promise<CityMeta | null>(resolve => {
        if (!('geolocation' in navigator)) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async position => {
            const city = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            if (city) {
              setCurrentCity(city);
              await loadWeather(city, unit);
            }
            resolve(city);
          },
          geoError => {
            console.warn('Geolocation failed or denied:', geoError);
            resolve(null);
          },
          GEO_OPTIONS
        );
      }),
    [loadWeather, unit]
  );

  const handleCurrentLocation = async () => {
    const city = await detectLocation();
    navigate('dashboard');
    if (city) {
      showToast('Location Found', `Successfully localized to ${city.name}`, 'success');
    } else {
      showToast(
        'Location Error',
        'Could not detect your location. Please check browser permissions.',
        'error'
      );
    }
  };

  const handleLocationAllow = async () => {
    setShowLocationPrompt(false);
    setLoading(true);
    const city = await detectLocation();
    if (!city) {
      setCurrentCity(FALLBACK_CITY);
      loadWeather(FALLBACK_CITY, unit);
    }
  };

  const handleLocationDeny = () => {
    setShowLocationPrompt(false);
    setSidebarOpen(true); // so they can search straight away
  };

  const handleMapLocationSelect = async (lat: number, lon: number) => {
    const city = await reverseGeocode(lat, lon);
    if (!city) return;
    setCurrentCity(city);
    await loadWeather(city, unit);
    navigate('dashboard');
  };

  const handleCitySelect = async (city: CityMeta) => {
    setCurrentCity(city);
    await loadWeather(city, unit);
  };

  const sameCity = (a: CityMeta, b: CityMeta) =>
    a.name === b.name && a.lat === b.lat && a.lon === b.lon;

  const handleSaveCity = (city: CityMeta) => {
    if (savedCities.some(c => sameCity(c, city))) return;
    setSavedCities([...savedCities, city]);
    showToast('City Saved', `${city.name} has been added to your saved cities.`, 'success');
  };

  const handleRemoveCity = (city: CityMeta) => {
    setSavedCities(savedCities.filter(c => !sameCity(c, city)));
    showToast('City Removed', `${city.name} has been removed.`, 'info');
  };

  const handleStart = () => {
    write(STORAGE_KEYS.started, 'true');
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="app">
      <a className="visually-hidden skip-link" href="#main-content">Skip to main content</a>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCitySelect={handleCitySelect}
        currentCity={currentCity}
        savedCities={savedCities}
        onSaveCity={handleSaveCity}
        onRemoveCity={handleRemoveCity}
        onNavigate={navigate}
        onCurrentLocation={handleCurrentLocation}
      />

      <main className="main-content" id="main-content">
        <div className="mobile-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mobile-logo"
            onClick={() => navigate('dashboard')}
            aria-label="OrbWeather home"
          >
            <span>OrbWeather</span>
          </button>
          <button
            className="mobile-search-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Search for a city"
          >
            <Search size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="weather-dashboard">
          {weather && <WeatherBackground weatherCode={weather.current.weather_code} />}

          {showLocationPrompt && (
            <LocationPromptModal onAllow={handleLocationAllow} onDeny={handleLocationDeny} />
          )}

          {activeView === 'settings' && (
            <Settings
              theme={theme} setTheme={setTheme}
              unit={unit} setUnit={setUnit}
              timeFormat={timeFormat} setTimeFormat={setTimeFormat}
              currentCity={currentCity}
            />
          )}
          {activeView === 'faq' && <Faq />}
          {activeView === 'about' && <About />}
          {activeView === 'radar' && currentCity && (
            <Suspense fallback={<div className="loading-state"><div className="spinner" /><p>Loading map…</p></div>}>
              <RadarMap currentCity={currentCity} onLocationSelect={handleMapLocationSelect} />
            </Suspense>
          )}

          {activeView === 'dashboard' && (
            loading && !weather ? (
              <div className="loading-state" role="status">
                <div className="spinner"></div>
                <p>Fetching live weather data...</p>
              </div>
            ) : error ? (
              <div className="error-state" role="alert">
                <h3>Oops!</h3>
                <p>{error}</p>
                <button onClick={() => currentCity && loadWeather(currentCity, unit)}>Retry</button>
              </div>
            ) : weather && aq && currentCity ? (
              <>
                <HeroCard weather={weather} cityMeta={currentCity} unit={unit} timeFormat={timeFormat} />
                <StatsRow weather={weather} unit={unit} timeFormat={timeFormat} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                  <UvMoonCard uvIndex={weather.daily.uv_index_max[0] || 0} />
                  <SunArc sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} timezone={weather.timezone} timeFormat={timeFormat} />
                </div>
                <Forecast weather={weather} timeFormat={timeFormat} />
                <AirQuality aq={aq} />
                <WorldCities unit={unit} savedCities={savedCities} onCitySelect={handleCitySelect} />
              </>
            ) : !showLocationPrompt ? (
              <div className="empty-state">
                <MapPin size={40} className="empty-state-icon" aria-hidden="true" />
                <h2>No location selected</h2>
                <p>
                  Search for a city or use your current location to see live conditions,
                  forecasts and air quality.
                </p>
                <div className="empty-state-actions">
                  <button className="empty-state-btn primary" onClick={() => setSidebarOpen(true)}>
                    <Search size={16} aria-hidden="true" /> Search for a city
                  </button>
                  <button className="empty-state-btn" onClick={handleCurrentLocation}>
                    <MapPin size={16} aria-hidden="true" /> Use current location
                  </button>
                </div>
              </div>
            ) : null
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
