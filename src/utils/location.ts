/**
 * Finding the device's position, and explaining the result honestly.
 *
 * Computers without GPS locate themselves from nearby Wi-Fi or, failing that,
 * their internet connection. The first answer is often that coarse network
 * guess, tens of kilometres out, with a sharper Wi-Fi fix arriving a moment
 * later. So rather than taking the first reading, this watches briefly and
 * keeps the most accurate one.
 */

export type LocationFailure = 'insecure' | 'unsupported' | 'denied' | 'unavailable' | 'timeout';

export type PositionResult =
  | { ok: true; lat: number; lon: number; accuracy: number }
  | { ok: false; reason: LocationFailure };

/** A fix this accurate (in metres) is used immediately. */
const GOOD_ENOUGH_METRES = 1000;
/** After the first fix, how long to wait for a better one. */
const SETTLE_MS = 4000;
/** Give up entirely after this long without any fix. */
const TIMEOUT_MS = 15000;
/** Below this uncertainty (in metres) the result is presented as exact. */
const APPROXIMATE_ABOVE_METRES = 2000;

type Geo = Pick<Geolocation, 'watchPosition' | 'clearWatch'>;

export function getPosition(
  geo: Geo | undefined = typeof navigator !== 'undefined' ? navigator.geolocation : undefined,
  secure: boolean = typeof window !== 'undefined' ? window.isSecureContext : true
): Promise<PositionResult> {
  // Browsers only expose location to https pages (and localhost).
  if (!secure) return Promise.resolve({ ok: false, reason: 'insecure' });
  if (!geo) return Promise.resolve({ ok: false, reason: 'unsupported' });

  return new Promise(resolve => {
    let best: GeolocationPosition | null = null;
    let settled = false;
    let watchId: number | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = (result: PositionResult) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) geo.clearWatch(watchId);
      clearTimeout(settleTimer);
      clearTimeout(timeoutTimer);
      resolve(result);
    };

    const finishWithBest = (fallback: LocationFailure) => {
      if (best) {
        const { latitude, longitude, accuracy } = best.coords;
        finish({ ok: true, lat: latitude, lon: longitude, accuracy });
      } else {
        finish({ ok: false, reason: fallback });
      }
    };

    timeoutTimer = setTimeout(() => finishWithBest('timeout'), TIMEOUT_MS);

    watchId = geo.watchPosition(
      position => {
        if (!best || position.coords.accuracy < best.coords.accuracy) best = position;
        if (best.coords.accuracy <= GOOD_ENOUGH_METRES) {
          finishWithBest('unavailable');
        } else if (settleTimer === undefined) {
          settleTimer = setTimeout(() => finishWithBest('unavailable'), SETTLE_MS);
        }
      },
      error => {
        // A refusal is final. Anything else keeps a fix we already have.
        if (error.code === error.PERMISSION_DENIED) finish({ ok: false, reason: 'denied' });
        else finishWithBest(error.code === error.TIMEOUT ? 'timeout' : 'unavailable');
      },
      { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: 0 }
    );

    // If the browser answered synchronously, the watch outlived finish().
    if (settled) geo.clearWatch(watchId);
  });
}

/**
 * A readable size for the uncertainty, or null when the fix is precise enough
 * to present without a caveat.
 */
export function approximateDistance(accuracyMetres: number): string | null {
  if (!Number.isFinite(accuracyMetres) || accuracyMetres <= APPROXIMATE_ABOVE_METRES) return null;
  const km = accuracyMetres / 1000;
  if (km < 10) return `about ${Math.round(km)} km`;
  if (km < 100) return `about ${Math.round(km / 5) * 5} km`;
  return 'more than 100 km';
}

/** What to tell the user when no usable location came back. */
export function locationFailureMessage(reason: LocationFailure | 'lookup'): string {
  switch (reason) {
    case 'denied':
      return 'Location access is blocked for OrbWeather. Allow it in your browser’s site settings, or search for your city.';
    case 'timeout':
      return 'Finding your location took too long. Try again, or search for your city.';
    case 'unavailable':
      return 'Your device couldn’t work out where you are. Check that location is turned on, or search for your city.';
    case 'unsupported':
      return 'This browser can’t share your location. Search for your city instead.';
    case 'insecure':
      return 'Location only works over a secure (https) connection. Search for your city instead.';
    case 'lookup':
      return 'Found your position but couldn’t look up the place name. Try again, or search for your city.';
  }
}
