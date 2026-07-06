import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Views.css';

function FaqItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{question}</h3>
        {isOpen ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
      </div>
      {isOpen && (
        <div style={{ marginTop: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {answer}
        </div>
      )}
    </div>
  );
}

export function Faq() {
  return (
    <div className="view-container animate-fade-up">
      <div className="view-header">
        <h1>Frequently Asked Questions</h1>
      </div>
      <div className="view-content" style={{ padding: '0 16px' }}>
        
        <FaqItem 
          question="How often is the data updated?" 
          answer="Our weather and air quality data is provided by Open-Meteo and is updated continuously every hour to ensure you always have the latest forecasts."
        />
        
        <FaqItem 
          question="Can I search for any city?" 
          answer="Yes! You can search for almost any location around the world. The search box uses a highly accurate global geocoding database."
        />
        
        <FaqItem 
          question="Are my saved cities private?" 
          answer="Absolutely. Your saved cities, application settings, and preferences are stored entirely locally on your own device using browser localStorage. We do not track, upload, or store your data on any external servers."
        />

        <FaqItem 
          question="How accurate are the predictions?" 
          answer={<>The forecasts and predictions are generated using advanced global weather models (such as GFS and ECMWF). However, <strong>please exercise caution</strong>—weather is inherently unpredictable. These forecasts are predictions, not absolute guarantees, and they may occasionally deviate from real-world conditions. Always consult local authorities for severe weather warnings.</>}
        />

        <FaqItem 
          question="Why does my current location show a different city?" 
          answer="When using a desktop computer without a GPS chip, your browser relies on your Internet Service Provider's (ISP) IP address to determine your location. ISPs often route traffic through centralized data hubs, which may cause your location to appear as the hub city rather than your exact physical address."
        />

        <FaqItem 
          question="What do the desktop notifications do?" 
          answer="If you enable desktop notifications in the Settings menu, OrbWeather will automatically check for severe weather conditions (like thunderstorms, heavy hail, or snow) in your currently selected city, and push a native alert to your computer screen to keep you informed."
        />

      </div>
    </div>
  );
}
