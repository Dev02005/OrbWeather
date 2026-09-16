import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPosition, approximateDistance, locationFailureMessage } from './location';

const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

/** A controllable stand-in for navigator.geolocation. */
function fakeGeo() {
  let onFix: PositionCallback = () => {};
  let onError: PositionErrorCallback | null | undefined;
  const geo = {
    watchPosition: vi.fn((success: PositionCallback, error?: PositionErrorCallback | null) => {
      onFix = success;
      onError = error;
      return 7;
    }),
    clearWatch: vi.fn(),
  };
  const fix = (lat: number, lon: number, accuracy: number) =>
    onFix({ coords: { latitude: lat, longitude: lon, accuracy } } as GeolocationPosition);
  const fail = (code: number) =>
    onError?.({ code, PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT, message: '' } as GeolocationPositionError);
  return { geo, fix, fail };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('getPosition', () => {
  it('uses a precise fix immediately', async () => {
    const { geo, fix } = fakeGeo();
    const result = getPosition(geo, true);
    fix(17.44, 78.35, 40);
    await expect(result).resolves.toEqual({ ok: true, lat: 17.44, lon: 78.35, accuracy: 40 });
    expect(geo.clearWatch).toHaveBeenCalledWith(7);
  });

  // The desktop case: a coarse network guess first, then a Wi-Fi fix.
  it('waits for a sharper fix after a coarse first guess, and keeps the best', async () => {
    const { geo, fix } = fakeGeo();
    const result = getPosition(geo, true);
    fix(17.0, 78.0, 25000); // internet-connection guess, 25 km out
    await vi.advanceTimersByTimeAsync(1500);
    fix(17.44, 78.35, 60); // Wi-Fi fix arrives
    await expect(result).resolves.toEqual({ ok: true, lat: 17.44, lon: 78.35, accuracy: 60 });
  });

  it('settles on the best coarse fix if nothing better arrives', async () => {
    const { geo, fix } = fakeGeo();
    const result = getPosition(geo, true);
    fix(17.0, 78.0, 25000);
    fix(17.2, 78.2, 9000); // better, but still coarse
    fix(16.0, 77.0, 40000); // worse — must not replace the better one
    await vi.advanceTimersByTimeAsync(4000);
    await expect(result).resolves.toEqual({ ok: true, lat: 17.2, lon: 78.2, accuracy: 9000 });
  });

  it('reports a refusal', async () => {
    const { geo, fail } = fakeGeo();
    const result = getPosition(geo, true);
    fail(PERMISSION_DENIED);
    await expect(result).resolves.toEqual({ ok: false, reason: 'denied' });
  });

  it('keeps a fix it already has when a later reading errors', async () => {
    const { geo, fix, fail } = fakeGeo();
    const result = getPosition(geo, true);
    fix(17.0, 78.0, 20000);
    fail(POSITION_UNAVAILABLE);
    await expect(result).resolves.toMatchObject({ ok: true, accuracy: 20000 });
  });

  it('times out when no fix ever arrives', async () => {
    const { geo } = fakeGeo();
    const result = getPosition(geo, true);
    await vi.advanceTimersByTimeAsync(15000);
    await expect(result).resolves.toEqual({ ok: false, reason: 'timeout' });
    expect(geo.clearWatch).toHaveBeenCalled();
  });

  it('distinguishes an unavailable position from a timeout', async () => {
    const { geo, fail } = fakeGeo();
    const result = getPosition(geo, true);
    fail(POSITION_UNAVAILABLE);
    await expect(result).resolves.toEqual({ ok: false, reason: 'unavailable' });
  });

  it('refuses on an insecure page and when the browser has no geolocation', async () => {
    await expect(getPosition(fakeGeo().geo, false)).resolves.toEqual({ ok: false, reason: 'insecure' });
    await expect(getPosition(undefined, true)).resolves.toEqual({ ok: false, reason: 'unsupported' });
  });

  it('survives a browser that answers synchronously', async () => {
    const geo = {
      watchPosition: vi.fn((success: PositionCallback) => {
        success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } } as GeolocationPosition);
        return 3;
      }),
      clearWatch: vi.fn(),
    };
    await expect(getPosition(geo, true)).resolves.toMatchObject({ ok: true, lat: 1, lon: 2 });
    expect(geo.clearWatch).toHaveBeenCalledWith(3);
  });
});

describe('approximateDistance', () => {
  it('stays silent for a precise fix', () => {
    expect(approximateDistance(40)).toBeNull();
    expect(approximateDistance(2000)).toBeNull();
  });

  it('describes coarse fixes in readable kilometres', () => {
    expect(approximateDistance(4300)).toBe('about 4 km');
    expect(approximateDistance(23000)).toBe('about 25 km');
    expect(approximateDistance(250000)).toBe('more than 100 km');
  });

  it('ignores a nonsense accuracy value', () => {
    expect(approximateDistance(Number.NaN)).toBeNull();
  });
});

describe('locationFailureMessage', () => {
  it('always points the user at search as a way forward', () => {
    for (const reason of ['denied', 'timeout', 'unavailable', 'unsupported', 'insecure', 'lookup'] as const) {
      expect(locationFailureMessage(reason), reason).toMatch(/search for your city/i);
    }
  });
});
