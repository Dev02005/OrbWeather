import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readEnum, readBoolean, readCity, readCityList, write } from './storage';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
});

afterEach(() => vi.unstubAllGlobals());

const THEMES = ['light', 'dark'] as const;

describe('readEnum', () => {
  it('returns a stored value that is in the allowed set', () => {
    store.set('theme', 'dark');
    expect(readEnum('theme', THEMES, 'light')).toBe('dark');
  });

  it('falls back when the key is absent', () => {
    expect(readEnum('theme', THEMES, 'light')).toBe('light');
  });

  // The point of validating rather than casting: localStorage is user-writable
  // and survives across versions, so it can hold anything.
  it('falls back on a value outside the union', () => {
    store.set('theme', 'solarized');
    expect(readEnum('theme', THEMES, 'light')).toBe('light');
  });

  it('falls back when storage throws, as in private browsing', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
    });
    expect(readEnum('theme', THEMES, 'light')).toBe('light');
  });
});

describe('readBoolean', () => {
  it('reads the stored string', () => {
    store.set('notify', 'true');
    expect(readBoolean('notify')).toBe(true);
    store.set('notify', 'false');
    expect(readBoolean('notify')).toBe(false);
  });

  it('uses the fallback only when the key is missing', () => {
    expect(readBoolean('notify', true)).toBe(true);
    store.set('notify', 'false');
    expect(readBoolean('notify', true)).toBe(false);
  });
});

describe('readCity', () => {
  const city = { name: 'Tokyo', countryCode: 'JP', country: 'Japan', lat: 35.68, lon: 139.69 };

  it('round-trips a valid city', () => {
    store.set('last', JSON.stringify(city));
    expect(readCity('last')).toEqual(city);
  });

  it('returns null for malformed JSON', () => {
    store.set('last', '{not json');
    expect(readCity('last')).toBeNull();
  });

  it('returns null when required fields are missing or the wrong type', () => {
    store.set('last', JSON.stringify({ name: 'Tokyo' }));
    expect(readCity('last')).toBeNull();

    store.set('last', JSON.stringify({ ...city, lat: '35.68' }));
    expect(readCity('last')).toBeNull();
  });

  it('rejects non-finite coordinates', () => {
    store.set('last', JSON.stringify({ ...city, lat: null }));
    expect(readCity('last')).toBeNull();
  });
});

describe('readCityList', () => {
  const valid = { name: 'Paris', countryCode: 'FR', country: 'France', lat: 48.85, lon: 2.35 };

  it('drops malformed entries but keeps the good ones', () => {
    store.set('saved', JSON.stringify([valid, { name: 'Broken' }, null, valid]));
    expect(readCityList('saved')).toEqual([valid, valid]);
  });

  it('returns an empty list for a non-array payload', () => {
    store.set('saved', JSON.stringify({ nope: true }));
    expect(readCityList('saved')).toEqual([]);
  });

  it('returns an empty list when absent', () => {
    expect(readCityList('saved')).toEqual([]);
  });
});

describe('write', () => {
  it('persists a value', () => {
    write('k', 'v');
    expect(store.get('k')).toBe('v');
  });

  it('swallows quota errors rather than breaking the render', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
    });
    expect(() => write('k', 'v')).not.toThrow();
  });
});
