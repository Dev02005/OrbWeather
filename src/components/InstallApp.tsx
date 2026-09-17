import { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '../contexts/toast-context';
import { InstallInstructions } from './InstallInstructions';
import { useInstallState, promptInstall } from '../hooks/useInstallPrompt';

/**
 * Lets someone install the app long after dismissing the landing page popup.
 * Settings leaves it out once the app is installed.
 */
export function InstallApp() {
  const state = useInstallState();
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const handleInstall = async () => {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        showToast('Installing', 'OrbWeather is being added to your device.', 'success');
      } else if (outcome === 'unavailable') {
        // The prompt expired or was already used — fall back to the manual steps.
        setShowSteps(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-stack">
      <p className="settings-note">
        Add OrbWeather to your home screen. It opens like an app, works offline, and can
        send you weather alerts.
      </p>

      {showSteps || state === 'manual' ? (
        <InstallInstructions />
      ) : (
        <button type="button" className="settings-btn primary" onClick={handleInstall} disabled={busy}>
          <Download size={16} aria-hidden="true" />
          {busy ? 'Opening…' : 'Install App'}
        </button>
      )}
    </div>
  );
}
