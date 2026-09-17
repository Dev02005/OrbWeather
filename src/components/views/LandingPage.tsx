import { useState, useEffect } from 'react';
import { useInstallState, promptInstall } from '../../hooks/useInstallPrompt';
import { CloudRain, Wind, Sun, ArrowRight, Download, X, Smartphone, Map, Search, Bell } from 'lucide-react';
import { InstallInstructions } from '../InstallInstructions';
import './LandingPage.css';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const installState = useInstallState();

  useEffect(() => {
    // Show the popup shortly after arrival, once the page has settled.
    const timer = setTimeout(() => setShowDownloadPopup(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    if (installState === 'prompt') {
      const outcome = await promptInstall();
      if (outcome !== 'unavailable') {
        setShowDownloadPopup(false);
        return;
      }
      setShowSteps(true);
    } else {
      // Safari, Firefox and iOS never fire beforeinstallprompt, so there is no
      // native prompt to show — walk the user through their browser's own menu.
      setShowSteps(true);
    }
  };

  return (
    <div className="landing-container">
      {showDownloadPopup && (
        <div className="download-overlay animate-fade-in">
          <div
            className="download-popup animate-fade-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-popup-title"
          >
            <button
              className="popup-close"
              onClick={() => setShowDownloadPopup(false)}
              aria-label="Close"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <div className="popup-icon-wrapper">
              <Smartphone size={32} className="text-blue" aria-hidden="true" />
            </div>
            <h3 id="install-popup-title">Install OrbWeather</h3>
            {showSteps ? (
              <>
                <InstallInstructions />
                <button className="btn-download" onClick={() => setShowDownloadPopup(false)}>
                  Got it
                </button>
              </>
            ) : (
              <>
                <p>
                  Add it to your phone or computer — no app store needed. Installed, it opens
                  like an app and can send you weather alerts.
                </p>
                <button className="btn-download" onClick={handleDownload}>
                  <Download size={18} aria-hidden="true" /> Install App
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="landing-content">
        <header className="landing-header">
          <div className="landing-logo">
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

          <div className="landing-text-content animate-fade-up fade-delay-1">
            <h3>More Than Just a Forecast</h3>
            <p>
              OrbWeather isn't just another weather website. It's a fully-fledged progressive web application designed to bring you the highest quality meteorological data without the bloat. 
              Built with privacy and performance in mind, all data is fetched directly to your device. There are no tracking scripts, no advertisements, and no paywalls.
            </p>
            <p>
              Whether you are tracking a severe thunderstorm heading your way, checking the exact moon phase for astrophotography, or monitoring local air quality before a run, OrbWeather provides everything you need in a beautiful, glassmorphic interface that adapts perfectly to your desktop, tablet, or smartphone.
            </p>
          </div>

          <div className="hero-features">
            <div className="feature-card">
              <Map size={28} className="feature-icon text-yellow" />
              <h3>Interactive Map</h3>
              <p>Click anywhere in the world to see its weather.</p>
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
              <Search size={28} className="feature-icon text-yellow" />
              <h3>Global Search</h3>
              <p>Find weather for millions of cities globally instantly.</p>
            </div>
            <div className="feature-card">
              <Bell size={28} className="feature-icon text-blue" />
              <h3>Weather Alerts</h3>
              <p>Get notified about storms and rain, even when the app is closed.</p>
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
            <a href="/terms">Terms of Usage</a>
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
