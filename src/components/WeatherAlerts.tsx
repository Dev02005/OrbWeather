import { useEffect, useState } from 'react';
import { Bell, BellOff, Send, Check } from 'lucide-react';
import { useToast } from '../contexts/toast-context';
import { InstallInstructions } from './InstallInstructions';
import {
  AlertsError,
  alertSupport,
  alertsCity as readAlertsCity,
  currentSubscription,
  disableAlerts,
  enableAlerts,
  sendTestAlert,
} from '../utils/push';
import type { CityMeta } from '../types';

interface WeatherAlertsProps {
  currentCity: CityMeta | null;
  timeFormat: '12h' | '24h';
}

type Status = 'checking' | 'dev' | 'unsupported' | 'needs-install' | 'blocked' | 'off' | 'on';
type Busy = null | 'enable' | 'disable' | 'test';

const sameCity = (a: CityMeta, b: CityMeta) => a.lat === b.lat && a.lon === b.lon;

function initialStatus(): Status {
  // The service worker is only registered in production builds.
  if (!import.meta.env.PROD) return 'dev';
  const support = alertSupport();
  if (support !== 'supported') return support;
  if (Notification.permission === 'denied') return 'blocked';
  return 'checking';
}

export function WeatherAlerts({ currentCity, timeFormat }: WeatherAlertsProps) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [alertCity, setAlertCity] = useState<CityMeta | null>(readAlertsCity);
  const [busy, setBusy] = useState<Busy>(null);

  // Whether this device is actually subscribed is only knowable asynchronously.
  useEffect(() => {
    if (status !== 'checking') return;
    let cancelled = false;
    currentSubscription()
      .catch(() => null)
      .then(subscription => {
        if (!cancelled) setStatus(subscription && readAlertsCity() ? 'on' : 'off');
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const run = async (kind: Exclude<Busy, null>, action: () => Promise<void>) => {
    setBusy(kind);
    try {
      await action();
    } catch (error) {
      const message =
        error instanceof AlertsError ? error.message : 'Something went wrong. Please try again.';
      showToast('Weather Alerts', message, 'error');
      if (Notification.permission === 'denied') setStatus('blocked');
    } finally {
      setBusy(null);
    }
  };

  const handleEnable = () =>
    run('enable', async () => {
      if (!currentCity) return;
      await enableAlerts(currentCity, timeFormat);
      setAlertCity(currentCity);
      setStatus('on');
      showToast('Alerts On', `You’ll be notified about bad weather in ${currentCity.name}.`, 'success');
    });

  const handleDisable = () =>
    run('disable', async () => {
      await disableAlerts();
      setAlertCity(null);
      setStatus('off');
      showToast('Alerts Off', 'You won’t receive weather notifications any more.', 'info');
    });

  const handleTest = () =>
    run('test', async () => {
      await sendTestAlert();
      showToast('Test Sent', 'It should arrive in a few seconds — try closing the app to see it.', 'success');
    });

  const summary = (
    <p className="settings-note">
      Get a notification when a thunderstorm, heavy rain or snow, or likely rain is heading your
      way — even when OrbWeather is closed. At most one of each kind every six hours.
    </p>
  );

  switch (status) {
    case 'checking':
      return <p className="settings-note" role="status">Checking notification status…</p>;

    case 'dev':
      return (
        <p className="settings-note">
          Weather alerts run in the deployed app — they need its service worker and server, which
          the development server does not provide.
        </p>
      );

    case 'unsupported':
      return (
        <p className="settings-note">
          This browser can’t receive notifications. Try Chrome, Edge or Firefox, or on iPhone,
          Safari with iOS 16.4 or later.
        </p>
      );

    case 'needs-install':
      return (
        <div className="settings-stack">
          <p className="settings-note">
            On iPhone and iPad, notifications only work once OrbWeather is on your Home Screen:
          </p>
          <InstallInstructions />
        </div>
      );

    case 'blocked':
      return (
        <p className="settings-note">
          Notifications are blocked for OrbWeather. Allow them in your browser’s site settings — on
          iPhone, <strong>Settings → Notifications → OrbWeather</strong> — then reload this page.
        </p>
      );

    case 'off':
      return (
        <div className="settings-stack">
          {summary}
          <button
            type="button"
            className="settings-btn primary"
            onClick={handleEnable}
            disabled={!currentCity || busy !== null}
          >
            <Bell size={16} aria-hidden="true" />
            {busy === 'enable'
              ? 'Turning on…'
              : currentCity
                ? `Enable alerts for ${currentCity.name}`
                : 'Choose a city first'}
          </button>
        </div>
      );

    case 'on': {
      const canSwitch = currentCity && alertCity && !sameCity(currentCity, alertCity);
      return (
        <div className="settings-stack">
          <p className="settings-status">
            <Check size={16} aria-hidden="true" />
            Alerts are on for <strong>{alertCity?.name ?? 'your city'}</strong>
          </p>
          {summary}
          <div className="settings-actions">
            <button type="button" className="settings-btn primary" onClick={handleTest} disabled={busy !== null}>
              <Send size={16} aria-hidden="true" />
              {busy === 'test' ? 'Sending…' : 'Send test notification'}
            </button>
            {canSwitch && (
              <button type="button" className="settings-btn" onClick={handleEnable} disabled={busy !== null}>
                <Bell size={16} aria-hidden="true" />
                {busy === 'enable' ? 'Switching…' : `Switch to ${currentCity.name}`}
              </button>
            )}
            <button type="button" className="settings-btn" onClick={handleDisable} disabled={busy !== null}>
              <BellOff size={16} aria-hidden="true" />
              {busy === 'disable' ? 'Turning off…' : 'Turn off'}
            </button>
          </div>
        </div>
      );
    }
  }
}
