import React from 'react';
import { MapPin, X } from 'lucide-react';
import './LocationPromptModal.css';

interface LocationPromptModalProps {
  onAllow: () => void;
  onDeny: () => void;
}

export function LocationPromptModal({ onAllow, onDeny }: LocationPromptModalProps) {
  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-fade-up">
        <button className="modal-close" onClick={onDeny}>
          <X size={20} />
        </button>
        
        <div className="modal-icon-container">
          <MapPin size={32} className="modal-icon text-blue" />
        </div>
        
        <h2>Enable Location Services</h2>
        <p>
          OrbWeather uses your location to provide hyper-local, accurate weather forecasts and real-time air quality data for your exact area.
        </p>
        
        <div className="modal-actions">
          <button className="btn-primary" onClick={onAllow}>
            Allow Location Access
          </button>
          <button className="btn-secondary" onClick={onDeny}>
            Search Manually Instead
          </button>
        </div>
      </div>
    </div>
  );
}
