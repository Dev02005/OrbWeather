import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { CityMeta } from '../../types';
import 'leaflet/dist/leaflet.css';
import './RadarMap.css';
import L from 'leaflet';

const customOrbIcon = L.divIcon({
  className: 'custom-orb-icon',
  html: `<div class="orb-marker"></div><div class="orb-pulse"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const pinIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: `<div style="color: var(--accent-rose); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); display: flex; flex-direction: column; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

interface RadarMapProps {
  currentCity: CityMeta;
  onLocationSelect: (lat: number, lon: number) => Promise<void>;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function RadarMap({ currentCity, onLocationSelect }: RadarMapProps) {
  const [isLocating, setIsLocating] = React.useState(false);
  const [physicalLocation, setPhysicalLocation] = React.useState<{lat: number, lon: number} | null>(null);

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPhysicalLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {} // silently fail if denied or off
      );
    }
  }, []);

  const handleLocationSelect = async (lat: number, lon: number) => {
    setIsLocating(true);
    await onLocationSelect(lat, lon);
    setIsLocating(false);
  };

  return (
    <div className="view-container map-container animate-fade-up">
      <div className="view-header">
        <h1>Interactive Map</h1>
      </div>
      <div className="map-wrapper">
        <MapContainer 
          key={`${currentCity.lat}-${currentCity.lon}`} 
          center={[currentCity.lat, currentCity.lon]} 
          zoom={10}
          minZoom={3}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          {/* Base Map */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
          />
          
          <MapEvents onLocationSelect={handleLocationSelect} />
          
          {physicalLocation && (
            <Marker position={[physicalLocation.lat, physicalLocation.lon]} icon={customOrbIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {(!physicalLocation || currentCity.lat !== physicalLocation.lat || currentCity.lon !== physicalLocation.lon) && (
            <Marker position={[currentCity.lat, currentCity.lon]} icon={pinIcon}>
              <Popup>
                {currentCity.name}, {currentCity.country}
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {isLocating && (
          <div className="map-loading-overlay">
            <div className="map-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}
