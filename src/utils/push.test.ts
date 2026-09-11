import { describe, it, expect, afterEach, vi } from 'vitest';
import { alertSupport, urlBase64ToUint8Array } from './push';
import { isIOS, isStandalone } from './platform';

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
