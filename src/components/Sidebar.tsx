import type { CityMeta } from '../types';
import type { ViewId } from '../routes';
import { fetchSuggestions } from '../services/geocoding';
import { isAbortError } from '../services/weather';
import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, MapPin, CloudRain, Check, Settings, HelpCircle, Info, Map, X } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentCity: CityMeta | null;
  savedCities: CityMeta[];
  onCitySelect: (city: CityMeta) => Promise<void>;
  onSaveCity: (city: CityMeta) => void;
  onRemoveCity: (city: CityMeta) => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
  onCurrentLocation: () => Promise<void>;
}

/** Cities can share a name, so identity is name plus coordinates. */
const cityKey = (city: CityMeta) => `${city.name}@${city.lat},${city.lon}`;
const sameCity = (a: CityMeta, b: CityMeta) => cityKey(a) === cityKey(b);

const regionOf = (city: CityMeta) =>
  city.admin1 ? `${city.admin1}, ${city.country}` : city.country;

export function Sidebar({
  currentCity,
  savedCities,
  onCitySelect,
  onSaveCity,
  onRemoveCity,
  isOpen,
  onClose,
  onNavigate,
  onCurrentLocation
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityMeta[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const closeSuggestions = () => {
    setSuggestions([]);
    setActiveIndex(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSuggestions();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length <= 1) {
      closeSuggestions();
      return;
    }

    // Abort in flight requests so a slow earlier query cannot overwrite the
    // results of a newer one.
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      try {
        setSuggestions(await fetchSuggestions(query, controller.signal));
        setActiveIndex(-1);
      } catch (error) {
        if (!isAbortError(error)) {
          console.error('City search failed:', error);
          closeSuggestions();
        }
      }
    }, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  const handleSelect = async (city: CityMeta) => {
    setLoadingAction(cityKey(city));
    await onCitySelect(city);
    onNavigate('dashboard');
    closeSuggestions();
    setQuery('');
    setLoadingAction(null);
    onClose();
  };

  // Arrow keys walk the list, Enter takes the highlighted result (falling back
  // to the first), Escape dismisses it.
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(suggestions[activeIndex >= 0 ? activeIndex : 0]);
    } else if (e.key === 'Escape') {
      closeSuggestions();
    }
  };

  const handleLocateClick = async () => {
    setLoadingAction('current');
    await onCurrentLocation();
    setLoadingAction(null);
    onClose();
  };

  const isCurrentSaved = currentCity && savedCities.some(c => sameCity(c, currentCity));
  const listboxId = 'city-search-results';

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Locations and navigation">
        <div className="sidebar-header">
          <button
            type="button"
            className="logo"
            onClick={() => { onNavigate('dashboard'); onClose(); }}
          >
            <CloudRain className="logo-icon" size={28} aria-hidden="true" />
            <span className="logo-text">OrbWeather</span>
          </button>
        </div>

        <div className="search-container" ref={searchRef}>
          <div className="search-box">
            <Search className="search-icon" size={18} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search any city..."
              aria-label="Search for a city"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `city-option-${activeIndex}` : undefined}
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="search-suggestions" id={listboxId} role="listbox" aria-label="City results">
              {suggestions.map((city, idx) => (
                <li
                  key={cityKey(city)}
                  id={`city-option-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`suggestion-item ${idx === activeIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <MapPin size={14} className="suggestion-icon" aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <div className="suggestion-name">{city.name}</div>
                    <div className="suggestion-country">{regionOf(city)}</div>
                  </div>
                  {loadingAction === cityKey(city) && <div className="btn-spinner" />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="footer-btn" onClick={handleLocateClick} disabled={loadingAction === 'current'}>
            <MapPin size={16} aria-hidden="true" />
            <span style={{ flex: 1, textAlign: 'left' }}>Use Current Location</span>
            {loadingAction === 'current' && <div className="btn-spinner" />}
          </button>
          <button className="footer-btn" onClick={() => { onNavigate('radar'); onClose(); }}>
            <Map size={16} aria-hidden="true" />
            <span>Weather Map</span>
          </button>
        </div>

        <div className="saved-section">
          <div className="section-header">
            <span>Saved Cities</span>
            {currentCity && !isCurrentSaved && (
              <button className="add-city-btn" onClick={() => onSaveCity(currentCity)}>
                + Save Current
              </button>
            )}
            {currentCity && isCurrentSaved && (
              <span className="saved-badge"><Check size={12} aria-hidden="true" /> Saved</span>
            )}
          </div>
          <div className="saved-cities-list">
            {savedCities.length === 0 && <p className="empty-text">No saved cities yet.</p>}
            {savedCities.map((city) => {
              const isActive = Boolean(currentCity && sameCity(city, currentCity));
              return (
                <div key={cityKey(city)} className={`city-item ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="city-item-main"
                    onClick={() => handleSelect(city)}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <MapPin size={16} className="city-icon" aria-hidden="true" />
                    <span className="city-item-labels">
                      <span className="city-name-text">{city.name}</span>
                      <span className="city-country-text">{regionOf(city)}</span>
                    </span>
                  </button>
                  {loadingAction === cityKey(city) ? (
                    <div className="btn-spinner" />
                  ) : (
                    <button
                      type="button"
                      className="city-remove-btn"
                      onClick={() => onRemoveCity(city)}
                      aria-label={`Remove ${city.name} from saved cities`}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="footer-btn" onClick={() => { onNavigate('settings'); onClose(); }}>
            <Settings size={16} aria-hidden="true" />
            <span>Settings</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={() => { onNavigate('faq'); onClose(); }}>
            <HelpCircle size={16} aria-hidden="true" />
            <span>FAQ</span>
          </button>
          <button className="footer-btn" onClick={() => { onNavigate('about'); onClose(); }}>
            <Info size={16} aria-hidden="true" />
            <span>About</span>
          </button>
          <div className="copyright-text">
            &copy; {new Date().getFullYear()} OrbWeather
          </div>
        </div>
      </aside>
    </>
  );
}
