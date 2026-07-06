import React, { useState, useEffect } from 'react';
import { Menu, Search } from 'lucide-react';
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
import { WeatherBackground } from './components/WeatherBackground';
import { UvMoonCard } from './components/UvMoonCard';
import { SunArc } from './components/SunArc';
import { fetchWeather } from './api/weather';
import { reverseGeocode } from './api/geocoding';
import { getWMO } from './api/weather';
import type { CityMeta, WeatherData, AirQualityData } from './types';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'settings' | 'faq' | 'about' | 'radar'>('dashboard');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('skyscope_theme') as any) || 'light'
  );
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>(
    (localStorage.getItem('skyscope_unit') as any) || 'celsius'
  );
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(
    (localStorage.getItem('skyscope_timeformat') as any) || '12h'
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem('skyscope_notifications') === 'true'
  );
  
  const [currentCity, setCurrentCity] = useState<CityMeta | null>(null);
  const [savedCities, setSavedCities] = useState<CityMeta[]>(
    JSON.parse(localStorage.getItem('skyscope_saved') || '[]')
  );

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aq, setAq] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('skyscope_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('skyscope_unit', unit);
    if (currentCity) {
      loadWeather(currentCity, unit);
    }
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('skyscope_timeformat', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    localStorage.setItem('skyscope_notifications', String(notifications));
    if (notifications && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  }, [notifications]);

  useEffect(() => {
    if (!weather || !notifications || Notification.permission !== 'granted') return;
    
    // Check if current weather code is severe (Thunderstorms or Snow/Hail)
    const severeCodes = [95, 96, 99, 71, 73, 75, 77, 85, 86];
    if (severeCodes.includes(weather.current.weather_code)) {
      new Notification('OrbWeather Alert', {
        body: `Severe weather detected in ${currentCity?.name}: ${getWMO(weather.current.weather_code).label}`,
        icon: '/favicon.ico'
      });
    }
  }, [weather, notifications, currentCity]);

  useEffect(() => {
    localStorage.setItem('skyscope_saved', JSON.stringify(savedCities));
  }, [savedCities]);

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const cityMeta = await reverseGeocode(lat, lon);
          if (cityMeta) {
            setCurrentCity(cityMeta);
            loadWeather(cityMeta, unit);
            setActiveView('dashboard');
          }
        },
        (error) => {
          console.warn('Geolocation failed or denied:', error);
          alert('Could not detect your location. Please check browser permissions.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleMapLocationSelect = async (lat: number, lon: number) => {
    const cityMeta = await reverseGeocode(lat, lon);
    if (cityMeta) {
      setCurrentCity(cityMeta);
      loadWeather(cityMeta, unit);
      setActiveView('dashboard');
    }
  };

  useEffect(() => {
    const lastCity = localStorage.getItem('skyscope_last_city');
    if (lastCity) {
      try {
        const c = JSON.parse(lastCity);
        setCurrentCity(c);
        loadWeather(c, unit);
        return;
      } catch { }
    }

    // If no last city, try to get current location on mount
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
  }, []);

  const loadWeather = async (city: CityMeta, currentUnit: 'celsius' | 'fahrenheit') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather({ lat: city.lat, lon: city.lon }, currentUnit);
      setWeather(data.weather);
      setAq(data.aq);
      localStorage.setItem('skyscope_last_city', JSON.stringify(city));
    } catch (err) {
      setError('Failed to load weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: CityMeta) => {
    setCurrentCity(city);
    loadWeather(city, unit);
  };

  const handleSaveCity = (city: CityMeta) => {
    const exists = savedCities.find(c => c.name === city.name && c.lat === city.lat);
    if (!exists) {
      setSavedCities([...savedCities, city]);
    }
  };

  const handleRemoveCity = (city: CityMeta) => {
    setSavedCities(savedCities.filter(c => !(c.name === city.name && c.lat === city.lat)));
  };

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
          <span className="mobile-logo" onClick={() => setActiveView('dashboard')} style={{ cursor: 'pointer' }}>OrbWeather</span>
          <button className="mobile-search-btn" onClick={() => setSidebarOpen(true)}>
            <Search size={20} />
          </button>
        </div>

        <div className="weather-dashboard">
          {weather && <WeatherBackground weatherCode={weather.current.weather_code} />}
          
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
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
