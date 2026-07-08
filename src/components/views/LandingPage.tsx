import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Sun, ArrowRight, Download, X, Smartphone, Map } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show popup automatically after 2.5 seconds
    const timer = setTimeout(() => {
      setShowDownloadPopup(true);
    }, 2500);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDownload = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
      setShowDownloadPopup(false);
    } else {
      alert('To install the app, click "Add to Home Screen" or the Install icon in your browser menu. OrbWeather is a Progressive Web App (PWA).');
      setShowDownloadPopup(false);
    }
  };

  return (
    <div className="landing-container">
      {showDownloadPopup && (
        <div className="download-overlay animate-fade-in">
          <div className="download-popup animate-fade-up">
            <button className="popup-close" onClick={() => setShowDownloadPopup(false)}>
              <X size={20} />
            </button>
            <div className="popup-icon-wrapper">
              <Smartphone size={32} className="text-blue" />
            </div>
            <h3>Get the OrbWeather App</h3>
            <p>Experience seamless weather tracking on the go. Available for iOS and Android.</p>
            <button className="btn-download" onClick={handleDownload}>
              <Download size={18} /> Download Now
            </button>
          </div>
        </div>
      )}

      <div className="landing-content">
        <header className="landing-header">
          <div className="landing-logo">
            <CloudRain className="logo-icon" size={32} />
            <h1>OrbWeather</h1>
          </div>
          <button className="header-download-btn" onClick={() => setShowDownloadPopup(true)}>
            <Download size={16} /> App
          </button>
        </header>

        <main className="landing-main animate-fade-up">
          <div className="hero-text-section">
            <h2 className="hero-title">
              Experience Weather <br />
              <span className="text-gradient">Like Never Before</span>
            </h2>
            <p className="hero-subtitle">
              Stunning visualizations, hyper-local forecasts, and advanced air quality insights wrapped in a beautiful, modern interface.
            </p>
            
            <button className="get-started-btn" onClick={onStart}>
              Get Started <ArrowRight size={20} className="btn-icon" />
            </button>
          </div>

          <div className="landing-text-content animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h3>More Than Just a Forecast</h3>
            <p>
              OrbWeather isn't just another weather website. It's a fully-fledged progressive web application designed to bring you the highest quality meteorological data without the bloat. 
              Built with privacy and performance in mind, all data is fetched directly to your device. There are no tracking scripts, no advertisements, and no paywalls.
            </p>
            <p>
              Whether you are tracking a severe thunderstorm heading your way, checking the exact moon phase for astrophotography, or monitoring local air quality before a run, OrbWeather provides everything you need in a beautiful, glassmorphic interface that adapts perfectly to your desktop, tablet, or smartphone.
            </p>
          </div>

          <div className="hero-features" style={{ animationDelay: '0.2s' }}>
            <div className="feature-card">
              <Sun size={28} className="feature-icon text-yellow" />
              <h3>Real-time Radar</h3>
              <p>Track storms and precipitation with interactive maps.</p>
            </div>
            <div className="feature-card">
              <Wind size={28} className="feature-icon text-blue" />
              <h3>Air Quality</h3>
              <p>Deep insights into local pollutants and safe breathing.</p>
            </div>
            <div className="feature-card">
              <CloudRain size={28} className="feature-icon text-purple" />
              <h3>7-Day Forecast</h3>
              <p>Plan ahead with accurate, hyper-local predictions.</p>
            </div>
            <div className="feature-card">
              <Map size={28} className="feature-icon text-yellow" />
              <h3>Global Search</h3>
              <p>Find weather for millions of cities globally instantly.</p>
            </div>
            <div className="feature-card">
              <CloudRain size={28} className="feature-icon text-blue" />
              <h3>Severe Alerts</h3>
              <p>Get instant notifications for severe weather conditions.</p>
            </div>
            <div className="feature-card">
              <Sun size={28} className="feature-icon text-purple" />
              <h3>Sun & Moon</h3>
              <p>Track precise sunset times and daily moon phases.</p>
            </div>
          </div>
        </main>

        <footer className="landing-footer">
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} OrbWeather. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
