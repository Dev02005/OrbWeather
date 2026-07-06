import type { CityMeta } from '../types';
import { fetchSuggestions } from '../api/geocoding';
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe, Check, Settings, HelpCircle, Info, Map } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentCity: CityMeta | null;
  savedCities: CityMeta[];
  onCitySelect: (city: CityMeta) => void;
  onSaveCity: (city: CityMeta) => void;
  onRemoveCity: (city: CityMeta) => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'dashboard' | 'settings' | 'faq' | 'about' | 'radar') => void;
  onCurrentLocation: () => void;
}


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
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        const results = await fetchSuggestions(query);
        const mapped = results.map((r: any) => ({
          name: r.name,
          countryCode: r.country_code || '',
          country: r.country || '',
          admin1: r.admin1 || '',
          lat: r.latitude,
          lon: r.longitude
        }));
        setSuggestions(mapped);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (city: CityMeta) => {
    onCitySelect(city);
    onNavigate('dashboard');
    setSuggestions([]);
    setQuery('');
    onClose();
  };

  const isCurrentSaved = currentCity && savedCities.some(c => c.name === currentCity.name && c.lat === currentCity.lat);

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => { onNavigate('dashboard'); onClose(); }} style={{ cursor: 'pointer' }}>
            <Globe className="logo-icon" size={28} />
            <span className="logo-text">OrbWeather</span>
          </div>
        </div>

        <div className="search-container" ref={searchRef}>
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search any city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions.length > 0) {
                  handleSelect(suggestions[0]);
                }
              }}
              autoComplete="off"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((city, idx) => (
                <div key={idx} className="suggestion-item" onClick={() => handleSelect(city)}>
                  <MapPin size={14} className="suggestion-icon" />
                  <div>
                    <div className="suggestion-name">{city.name}</div>
                    <div className="suggestion-country">{city.admin1 ? `${city.admin1}, ${city.country}` : city.country}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="footer-btn" onClick={() => { onCurrentLocation(); onClose(); }}>
            <MapPin size={16} />
            <span>Use Current Location</span>
          </button>
          <button className="footer-btn" onClick={() => { onNavigate('radar'); onClose(); }}>
            <Map size={16} />
            <span>Weather Map</span>
          </button>
        </div>

        <div className="saved-section">
          <div className="section-header">
            <span>Saved Cities</span>
            {currentCity && !isCurrentSaved && (
              <button className="add-city-btn" onClick={() => onSaveCity(currentCity)} title="Save current city">
                + Save Current
              </button>
            )}
            {currentCity && isCurrentSaved && (
              <span className="saved-badge"><Check size={12}/> Saved</span>
            )}
          </div>
          <div className="saved-cities-list">
            {savedCities.length === 0 && <p className="empty-text">No saved cities yet.</p>}
            {savedCities.map((city, idx) => (
              <div key={idx} className={`city-item ${currentCity?.name === city.name ? 'active' : ''}`} onClick={() => handleSelect(city)}>
                <div className="city-item-left">
                  <MapPin size={16} className="city-icon" />
                  <div>
                    <div className="city-name-text">{city.name}</div>
                    <div className="city-country-text">{city.admin1 ? `${city.admin1}, ${city.country}` : city.country}</div>
                  </div>
                </div>
                <button className="city-remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveCity(city); }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="footer-btn" onClick={() => { onNavigate('settings'); onClose(); }}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={() => { onNavigate('faq'); onClose(); }}>
            <HelpCircle size={16} />
            <span>FAQ</span>
          </button>
          <button className="footer-btn" onClick={() => { onNavigate('about'); onClose(); }}>
            <Info size={16} />
            <span>About</span>
          </button>
        </div>
      </aside>
    </>
  );
}
