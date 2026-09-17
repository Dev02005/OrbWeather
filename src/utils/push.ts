import type { CityMeta, TimeFormat } from '../types';
import { isIOS, isStandalone } from './platform';
import { STORAGE_KEYS, readCity, remove, write } from './storage';

/**
 * Client side of the push-alert feature. The server half lives in `/api`; see
 * the README for how the two fit together.
 */

export type AlertSupport = 'supported' | 'needs-install' | 'unsupported';

/** A failure carrying a message fit to show the user as-is. */
export class AlertsError extends Error {
  /** The HTTP status, when the alert server refused the request. */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export function alertSupport(): AlertSupport {
  const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (hasApis) return 'supported';
  // iOS only exposes Web Push to sites launched from the Home Screen (16.4+).
  if (isIOS() && !isStandalone()) return 'needs-install';
  return 'unsupported';
}

/** VAPID keys travel as base64url; the Push API wants the raw bytes. */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}

function sameBytes(a: ArrayBuffer | null, b: Uint8Array) {
  if (!a || a.byteLength !== b.byteLength) return false;
  const view = new Uint8Array(a);
  return view.every((byte, i) => byte === b[i]);
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(
      path,
      body === undefined
        ? undefined
        : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    );
  } catch {
    throw new AlertsError('Could not reach OrbWeather. Check your connection and try again.');
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new AlertsError(data.error ?? `Something went wrong (${res.status}).`, res.status);
  return data as T;
}

/** Waits for the service worker, but not forever if it failed to install. */
function readyRegistration(): Promise<ServiceWorkerRegistration> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new AlertsError('The app is still getting ready. Reload the page and try again.')),
      10_000
    )
  );
  return Promise.race([navigator.serviceWorker.ready, timeout]);
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (alertSupport() !== 'supported') return null;
  const registration = await navigator.serviceWorker.getRegistration();
  return registration ? registration.pushManager.getSubscription() : null;
}

/** The city alerts are currently set up for on this device, if any. */
export const alertsCity = () => readCity(STORAGE_KEYS.alertsCity);

function subscribeBody(subscription: PushSubscription, city: CityMeta, timeFormat: TimeFormat) {
  return {
    subscription: subscription.toJSON(),
    city: { name: city.name, lat: city.lat, lon: city.lon },
    timeFormat,
  };
}

/**
 * Gives this device a push subscription the server can use, and puts it on the
 * server's record for `city`. `fresh` replaces the subscription even when it
 * looks valid, for when the push service has reported it gone.
 */
async function registerDevice(city: CityMeta, timeFormat: TimeFormat, fresh = false): Promise<void> {
  const { publicKey } = await api<{ publicKey?: string }>('/api/push-key');
  if (!publicKey) throw new AlertsError('Weather alerts are not available on this server yet.');
  const serverKey = urlBase64ToUint8Array(publicKey);

  const registration = await readyRegistration();
  let subscription = await registration.pushManager.getSubscription();

  // A subscription made with an old key can never receive our pushes.
  if (subscription && (fresh || !sameBytes(subscription.options.applicationServerKey, serverKey))) {
    await subscription.unsubscribe();
    subscription = null;
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: serverKey,
  });

  await api('/api/subscribe', subscribeBody(subscription, city, timeFormat));
  write(STORAGE_KEYS.alertsCity, JSON.stringify(city));
}

/** Asks permission, subscribes this device, and registers it for `city`. */
export async function enableAlerts(city: CityMeta, timeFormat: TimeFormat): Promise<void> {
  // Ask first, while this still runs inside the tap that triggered it: Safari
  // ignores permission prompts that arrive after unrelated awaits.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new AlertsError(
      permission === 'denied'
        ? 'Notifications are blocked for OrbWeather. Allow them in your browser or phone settings, then try again.'
        : 'Notifications were not allowed, so alerts stay off.'
    );
  }

  await registerDevice(city, timeFormat);
}

export async function disableAlerts(): Promise<void> {
  const subscription = await currentSubscription();
  if (subscription) {
    // If the server is unreachable the device still unsubscribes; its stale
    // record then fails on the next push and is pruned automatically.
    await api('/api/unsubscribe', { endpoint: subscription.endpoint }).catch(() => undefined);
    await subscription.unsubscribe();
  }
  remove(STORAGE_KEYS.alertsCity);
}

/** How many times a test repairs the registration before giving up. */
const MAX_TEST_REPAIRS = 2;

/**
 * Sends a test notification. If the server has no record of this device (404)
 * or the push service has dropped its subscription (410), the app would still
 * show alerts as on while nothing could arrive — so it registers again, with a
 * brand-new subscription for a 410, and retries.
 */
export async function sendTestAlert(timeFormat: TimeFormat): Promise<void> {
  const city = alertsCity();

  for (let repairs = 0; ; repairs++) {
    const subscription = await currentSubscription();
    if (!city || !subscription) {
      remove(STORAGE_KEYS.alertsCity);
      throw new AlertsError('Alerts are off on this device. Turn them on first.');
    }

    try {
      await api('/api/test-push', { endpoint: subscription.endpoint });
      return;
    } catch (error) {
      const status = error instanceof AlertsError ? error.status : undefined;
      if (repairs === MAX_TEST_REPAIRS || (status !== 404 && status !== 410)) throw error;
      await registerDevice(city, timeFormat, status === 410);
    }
  }
}

/**
 * Registers this device again on launch. That heals every way the two sides
 * drift apart — a record the server lost, a rotated endpoint, a changed server
 * key, a changed 12/24-hour preference — for the cost of two small requests.
 */
export async function syncAlerts(timeFormat: TimeFormat): Promise<void> {
  const city = alertsCity();
  if (!city || alertSupport() !== 'supported' || Notification.permission !== 'granted') return;

  if (!(await currentSubscription())) {
    remove(STORAGE_KEYS.alertsCity); // revoked from the browser's side
    return;
  }
  await registerDevice(city, timeFormat);
}
