import { describe, it, expect, afterEach, vi } from 'vitest';
import { AlertsError, alertSupport, sendTestAlert, syncAlerts, urlBase64ToUint8Array } from './push';
import { isIOS, isStandalone } from './platform';
import { STORAGE_KEYS } from './storage';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPAD_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

interface Env {
  userAgent: string;
  maxTouchPoints?: number;
  standaloneDisplay?: boolean;
  iosStandalone?: boolean;
  pushApis?: boolean;
}

/** Recreates just enough of a browser for the detection code to run. */
function browser({ userAgent, maxTouchPoints = 0, standaloneDisplay = false, iosStandalone, pushApis = false }: Env) {
  const navigator: Record<string, unknown> = { userAgent, maxTouchPoints };
  if (iosStandalone !== undefined) navigator.standalone = iosStandalone;
  if (pushApis) navigator.serviceWorker = {};

  const window: Record<string, unknown> = {
    navigator,
    matchMedia: () => ({ matches: standaloneDisplay }),
  };
  if (pushApis) {
    window.PushManager = function PushManager() {};
    window.Notification = function Notification() {};
  }

  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', window);
}

afterEach(() => vi.unstubAllGlobals());

describe('isStandalone', () => {
  // The regression this guards: iOS Safari defines navigator.standalone on
  // every page, as false, so checking for the property alone is always true.
  it('is false in iOS Safari, where the flag exists but is false', () => {
    browser({ userAgent: IPHONE_UA, iosStandalone: false });
    expect(isStandalone()).toBe(false);
  });

  it('is true when launched from the iOS Home Screen', () => {
    browser({ userAgent: IPHONE_UA, iosStandalone: true });
    expect(isStandalone()).toBe(true);
  });

  it('uses the display mode everywhere else', () => {
    browser({ userAgent: ANDROID_UA, standaloneDisplay: true });
    expect(isStandalone()).toBe(true);
    browser({ userAgent: ANDROID_UA });
    expect(isStandalone()).toBe(false);
  });
});

describe('isIOS', () => {
  it('recognises iPhones, and iPads that report as a touch-screen Mac', () => {
    browser({ userAgent: IPHONE_UA });
    expect(isIOS()).toBe(true);
    browser({ userAgent: IPAD_UA, maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
  });

  it('does not mistake a real Mac or Android for iOS', () => {
    browser({ userAgent: IPAD_UA, maxTouchPoints: 0 });
    expect(isIOS()).toBe(false);
    browser({ userAgent: ANDROID_UA });
    expect(isIOS()).toBe(false);
  });
});

describe('alertSupport', () => {
  it('is supported wherever the Push API exists', () => {
    browser({ userAgent: ANDROID_UA, pushApis: true });
    expect(alertSupport()).toBe('supported');
  });

  it('asks iPhone users in Safari to install first', () => {
    browser({ userAgent: IPHONE_UA, iosStandalone: false });
    expect(alertSupport()).toBe('needs-install');
  });

  it('is supported in an installed iOS app on 16.4+', () => {
    browser({ userAgent: IPHONE_UA, iosStandalone: true, pushApis: true });
    expect(alertSupport()).toBe('supported');
  });

  it('is unsupported in an installed iOS app too old for Web Push', () => {
    browser({ userAgent: IPHONE_UA, iosStandalone: true });
    expect(alertSupport()).toBe('unsupported');
  });
});

describe('urlBase64ToUint8Array', () => {
  it('decodes base64url without padding into raw bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    const encoded = Buffer.from(bytes).toString('base64url');
    expect(encoded).not.toContain('='); // exercises the re-padding path
    expect(Array.from(urlBase64ToUint8Array(encoded))).toEqual(Array.from(bytes));
  });

  it('round-trips a real 65-byte VAPID public key', () => {
    const key = Buffer.alloc(65, 7);
    key[0] = 4; // uncompressed point marker
    expect(urlBase64ToUint8Array(key.toString('base64url'))).toHaveLength(65);
  });
});

describe('repairing a device the alert server cannot reach', () => {
  const CITY = { name: 'Bhimunipatnam', country: 'India', countryCode: 'IN', lat: 17.89, lon: 83.45 };
  const SERVER_KEY = Buffer.alloc(65, 4).toString('base64url');
  const OLD_KEY = Buffer.alloc(65, 9).toString('base64url');

  interface Device {
    /** Status codes /api/test-push answers with, in order; 200 once they run out. */
    testStatuses?: number[];
    subscribed?: boolean;
    subscriptionKey?: string;
  }

  /**
   * A browser holding a push subscription, talking to a scripted alert server.
   * `calls` records each request by path and the device it was for, so tests
   * can assert the exact repair sequence.
   */
  function device({ testStatuses = [], subscribed = true, subscriptionKey = SERVER_KEY }: Device = {}) {
    browser({ userAgent: ANDROID_UA, pushApis: true });
    vi.stubGlobal('Notification', { permission: 'granted' });

    let issued = 0;
    const makeSubscription = (key: string) => {
      const endpoint = `https://fcm.googleapis.com/fcm/send/device-${++issued}`;
      return {
        endpoint,
        options: { applicationServerKey: urlBase64ToUint8Array(key).buffer },
        toJSON: () => ({ endpoint, keys: { p256dh: 'p256dh', auth: 'auth' } }),
        unsubscribe: async () => {
          current = null;
          return true;
        },
      };
    };
    let current: ReturnType<typeof makeSubscription> | null = subscribed ? makeSubscription(subscriptionKey) : null;

    const registration = {
      pushManager: {
        getSubscription: async () => current,
        subscribe: async () => (current = makeSubscription(SERVER_KEY)),
      },
    };
    Object.assign(navigator, {
      serviceWorker: { ready: Promise.resolve(registration), getRegistration: async () => registration },
    });

    const storage = new Map([[STORAGE_KEYS.alertsCity as string, JSON.stringify(CITY)]]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });

    const calls: string[] = [];
    const statuses = [...testStatuses];
    const deviceOf = (endpoint: string) => endpoint.split('/').pop();
    vi.stubGlobal('fetch', async (path: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      switch (path) {
        case '/api/push-key':
          calls.push('push-key');
          return Response.json({ publicKey: SERVER_KEY });
        case '/api/subscribe':
          calls.push(`subscribe ${deviceOf(body.subscription.endpoint)}`);
          return Response.json({ ok: true });
        default: {
          calls.push(`test ${deviceOf(body.endpoint)}`);
          const status = statuses.shift() ?? 200;
          return Response.json(status === 200 ? { ok: true } : { error: `Failed with ${status}` }, { status });
        }
      }
    });

    return { calls, storage };
  }

  it('sends the test straight away when the server knows the device', async () => {
    const { calls } = device();
    await sendTestAlert('12h');
    expect(calls).toEqual(['test device-1']);
  });

  // The bug this guards: Settings said alerts were on while the server had no
  // record, and the test button only answered "not subscribed".
  it('registers the same subscription again when the server has lost its record', async () => {
    const { calls } = device({ testStatuses: [404] });
    await sendTestAlert('12h');
    expect(calls).toEqual(['test device-1', 'push-key', 'subscribe device-1', 'test device-1']);
  });

  it('replaces a subscription the push service has dropped', async () => {
    const { calls } = device({ testStatuses: [410] });
    await sendTestAlert('24h');
    expect(calls).toEqual(['test device-1', 'push-key', 'subscribe device-2', 'test device-2']);
  });

  it('repairs a lost record and then a dropped subscription in one go', async () => {
    const { calls } = device({ testStatuses: [404, 410] });
    await sendTestAlert('12h');
    expect(calls.filter(call => call.startsWith('test'))).toEqual(['test device-1', 'test device-1', 'test device-2']);
  });

  it('gives up after two repairs rather than looping', async () => {
    const { calls } = device({ testStatuses: [404, 404, 404, 404] });
    await expect(sendTestAlert('12h')).rejects.toMatchObject({ status: 404 });
    expect(calls.filter(call => call.startsWith('test'))).toHaveLength(3);
  });

  it('does not re-register for failures a new registration cannot fix', async () => {
    const { calls } = device({ testStatuses: [429] });
    await expect(sendTestAlert('12h')).rejects.toBeInstanceOf(AlertsError);
    expect(calls).toEqual(['test device-1']);
  });

  it('turns alerts off locally when the browser holds no subscription', async () => {
    const { calls, storage } = device({ subscribed: false });
    await expect(sendTestAlert('12h')).rejects.toBeInstanceOf(AlertsError);
    expect(calls).toEqual([]);
    expect(storage.has(STORAGE_KEYS.alertsCity)).toBe(false);
  });

  it('on launch, replaces a subscription made with an old server key', async () => {
    const { calls } = device({ subscriptionKey: OLD_KEY });
    await syncAlerts('12h');
    expect(calls).toEqual(['push-key', 'subscribe device-2']);
  });

  it('on launch, re-registers a valid subscription as it is', async () => {
    const { calls } = device();
    await syncAlerts('12h');
    expect(calls).toEqual(['push-key', 'subscribe device-1']);
  });
});
