import type { CityMeta } from '../types';

/**
 * localStorage is user-writable and survives across app versions, so every read
 * is validated rather than cast. An unrecognised value falls back to the
 * default instead of flowing into the app as a broken union member.
 */

export const STORAGE_KEYS = {
  theme: 'orbweather_theme',
  unit: 'orbweather_unit',
  timeFormat: 'orbweather_timeformat',
  backgroundMotion: 'orbweather_background_motion',
  /** The city this device's push alerts are for; present only while alerts are on. */
  alertsCity: 'orbweather_alerts_city',
  saved: 'orbweather_saved',
  lastCity: 'orbweather_last_city',
  started: 'orbweather_started',
} as const;

/** Reads a key that must be one of `allowed`, else returns `fallback`. */
export function readEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    // Private browsing and blocked-storage modes throw on access.
    return fallback;
  }
}

export function readBoolean(key: string, fallback = false): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage disabled — nothing was persisted to remove.
  }
}

export function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage disabled — preferences just will not persist.
  }
}

function isCityMeta(value: unknown): value is CityMeta {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.name === 'string' &&
    typeof c.lat === 'number' &&
    typeof c.lon === 'number' &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lon)
  );
}

/** A stored city, or null if the entry is missing or malformed. */
export function readCity(key: string): CityMeta | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCityMeta(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Stored cities, with any malformed entries dropped. */
export function readCityList(key: string): CityMeta[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCityMeta) : [];
  } catch {
    return [];
  }
}
