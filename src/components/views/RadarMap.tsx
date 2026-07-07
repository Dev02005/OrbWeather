import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { CityMeta } from '../../types';
import 'leaflet/dist/leaflet.css';
import './RadarMap.css';
import L from 'leaflet';

const customOrbIcon = L.divIcon({
  className: 'custom-orb-icon',
  html: `<div class="orb-marker"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
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
          
          <Marker position={[currentCity.lat, currentCity.lon]} icon={customOrbIcon}>
            <Popup>
              {currentCity.name}, {currentCity.country}
            </Popup>
          </Marker>
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
