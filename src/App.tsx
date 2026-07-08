import React, { useState, useEffect } from 'react';
import { Menu, Search, CloudRain } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { HeroCard } from './components/HeroCard';
import { StatsRow } from './components/StatsRow';
import { Forecast } from './components/Forecast';
import { AirQuality } from './components/AirQuality';
import { WorldCities } from './components/WorldCities';
import { Settings } from './components/views/Settings';
import { Faq } from './components/views/Faq';
import { About } from './components/views/About';
import { RadarMap } from './components/views/RadarMap';
import { LandingPage } from './components/views/LandingPage';
import { LocationPromptModal } from './components/LocationPromptModal';
import { WeatherBackground } from './components/WeatherBackground';
import { UvMoonCard } from './components/UvMoonCard';
import { SunArc } from './components/SunArc';
import { fetchWeather } from './api/weather';
import { reverseGeocode } from './api/geocoding';
import { getWMO } from './api/weather';
import { useToast } from './contexts/ToastContext';
import type { CityMeta, WeatherData, AirQualityData } from './types';
import './App.css';

function App() {
  const [hasStarted, setHasStarted] = useState(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    return isPWA || localStorage.getItem('orbweather_started') === 'true';
  });
  const [activeView, setActiveView] = useState<'dashboard' | 'settings' | 'faq' | 'about' | 'radar'>('dashboard');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('orbweather_theme') as any) || 'light'
  );
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>(
    (localStorage.getItem('orbweather_unit') as any) || 'celsius'
  );
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(
    (localStorage.getItem('orbweather_timeformat') as any) || '12h'
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem('orbweather_notifications') === 'true'
  );
  
  const [currentCity, setCurrentCity] = useState<CityMeta | null>(null);
  const [savedCities, setSavedCities] = useState<CityMeta[]>(
    JSON.parse(localStorage.getItem('orbweather_saved') || '[]')
  );

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aq, setAq] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('orbweather_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('orbweather_unit', unit);
    if (currentCity) {
      loadWeather(currentCity, unit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('orbweather_timeformat', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    localStorage.setItem('orbweather_notifications', String(notifications));
    if (notifications && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  }, [notifications]);

  const lastAlertTime = React.useRef<number>(0);

  useEffect(() => {
    if (!weather || !notifications || Notification.permission !== 'granted') return;
    
    const severeCodes = [95, 96, 99, 71, 73, 75, 77, 85, 86];
    if (severeCodes.includes(weather.current.weather_code)) {
      const now = Date.now();
      // Rate limit: only alert once every 2 hours to avoid spamming during a long storm
      if (now - lastAlertTime.current > 7200000) {
        showToast(
          'Severe Weather Alert',
          `Severe weather detected in ${currentCity?.name}: ${getWMO(weather.current.weather_code).label}`,
          'alert'
        );
        // Still show system notification if app is in background
        if (document.hidden) {
          new Notification('OrbWeather Alert', {
            body: `Severe weather detected in ${currentCity?.name}: ${getWMO(weather.current.weather_code).label}`,
            icon: '/favicon.svg'
          });
        }
        lastAlertTime.current = now;
      }
    }
  }, [weather, notifications, currentCity]);

  // Background polling for live weather updates
  useEffect(() => {
    if (!notifications || !currentCity) return;
    
    // Poll every 15 minutes (900000 ms) to check for incoming severe weather
    const interval = setInterval(() => {
      loadWeather(currentCity, unit);
    }, 900000);

    return () => clearInterval(interval);
  }, [notifications, currentCity, unit]);

  useEffect(() => {
    localStorage.setItem('orbweather_saved', JSON.stringify(savedCities));
  }, [savedCities]);

  const handleCurrentLocation = async (): Promise<void> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const cityMeta = await reverseGeocode(lat, lon);
            if (cityMeta) {
              setCurrentCity(cityMeta);
              await loadWeather(cityMeta, unit);
              setActiveView('dashboard');
              showToast('Location Found', `Successfully localized to ${cityMeta.name}`, 'success');
            }
            resolve();
          },
          (error) => {
            console.warn('Geolocation failed or denied:', error);
            showToast('Location Error', 'Could not detect your location. Please check browser permissions.', 'error');
            resolve();
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        showToast('Not Supported', 'Geolocation is not supported by your browser.', 'error');
        resolve();
      }
    });
  };

  const handleMapLocationSelect = async (lat: number, lon: number) => {
    const cityMeta = await reverseGeocode(lat, lon);
    if (cityMeta) {
      setCurrentCity(cityMeta);
      await loadWeather(cityMeta, unit);
      setActiveView('dashboard');
    }
  };

  useEffect(() => {
    const lastCity = localStorage.getItem('orbweather_last_city');
    if (lastCity) {
      try {
        const c = JSON.parse(lastCity);
        setCurrentCity(c);
        loadWeather(c, unit);
        return;
      } catch { }
    }

    // If no last city, show location prompt modal instead of automatically asking
    setShowLocationPrompt(true);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationAllow = () => {
    setShowLocationPrompt(false);
    setLoading(true);
    const fallbackCity: CityMeta = { name: 'London', countryCode: 'GB', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 };
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const cityMeta = await reverseGeocode(lat, lon);
          if (cityMeta) {
            setCurrentCity(cityMeta);
            loadWeather(cityMeta, unit);
          } else {
            setCurrentCity(fallbackCity);
            loadWeather(fallbackCity, unit);
          }
        },
        (error) => {
          console.warn('Geolocation failed or denied:', error);
          setCurrentCity(fallbackCity);
          loadWeather(fallbackCity, unit);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setCurrentCity(fallbackCity);
      loadWeather(fallbackCity, unit);
    }
  };

  const handleLocationDeny = () => {
    setShowLocationPrompt(false);
    // Open sidebar so they can search
    setSidebarOpen(true);
  };

  const loadWeather = async (city: CityMeta, currentUnit: 'celsius' | 'fahrenheit') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather({ lat: city.lat, lon: city.lon }, currentUnit);
      setWeather(data.weather);
      setAq(data.aq);
      localStorage.setItem('orbweather_last_city', JSON.stringify(city));
    } catch (err) {
      console.error(err);
      setError('Failed to load weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = async (city: CityMeta) => {
    setCurrentCity(city);
    await loadWeather(city, unit);
  };

  const handleSaveCity = (city: CityMeta) => {
    const exists = savedCities.find(c => c.name === city.name && c.lat === city.lat);
    if (!exists) {
      setSavedCities([...savedCities, city]);
      showToast('City Saved', `${city.name} has been added to your saved cities.`, 'success');
    }
  };

  const handleRemoveCity = (city: CityMeta) => {
    setSavedCities(savedCities.filter(c => !(c.name === city.name && c.lat === city.lat)));
    showToast('City Removed', `${city.name} has been removed.`, 'info');
  };

  const handleStart = () => {
    localStorage.setItem('orbweather_started', 'true');
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="app">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onCitySelect={handleCitySelect}
          currentCity={currentCity}
          savedCities={savedCities}
          onSaveCity={handleSaveCity}
          onRemoveCity={handleRemoveCity}
          onNavigate={setActiveView}
          onCurrentLocation={handleCurrentLocation}
        />

      <main className="main-content">
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="mobile-logo" onClick={() => setActiveView('dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudRain size={20} />
            <span>OrbWeather</span>
          </div>
          <button className="mobile-search-btn" onClick={() => setSidebarOpen(true)}>
            <Search size={20} />
          </button>
        </div>

        <div className="weather-dashboard">
          {weather && <WeatherBackground weatherCode={weather.current.weather_code} />}
          
          {showLocationPrompt && (
            <LocationPromptModal 
              onAllow={handleLocationAllow} 
              onDeny={handleLocationDeny} 
            />
          )}

          {activeView === 'settings' && (
            <Settings 
              theme={theme} setTheme={setTheme} 
              unit={unit} setUnit={setUnit} 
              timeFormat={timeFormat} setTimeFormat={setTimeFormat} 
              notifications={notifications} setNotifications={setNotifications}
            />
          )}
          {activeView === 'faq' && <Faq />}
          {activeView === 'about' && <About />}
          {activeView === 'radar' && currentCity && <RadarMap currentCity={currentCity} onLocationSelect={handleMapLocationSelect} />}

          {activeView === 'dashboard' && (
            loading && !weather ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Fetching live weather data...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <h3>Oops!</h3>
                <p>{error}</p>
                <button onClick={() => currentCity && loadWeather(currentCity, unit)}>Retry</button>
              </div>
            ) : weather && aq && currentCity ? (
              <>
                <HeroCard weather={weather} cityMeta={currentCity} unit={unit} timeFormat={timeFormat} />
                <StatsRow weather={weather} unit={unit} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                  <UvMoonCard uvIndex={weather.daily.uv_index_max[0] || 0} />
                  <SunArc sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} timeFormat={timeFormat} />
                </div>
                <Forecast weather={weather} timeFormat={timeFormat} />
                <AirQuality aq={aq} />
                <WorldCities unit={unit} savedCities={savedCities} onCitySelect={handleCitySelect} />
              </>
            ) : null
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
