/**
 * Types shared by the push-alert functions. Files under `api/_lib` start with
 * an underscore so Vercel treats them as modules, not as public endpoints.
 */

export type AlertKind = 'severe' | 'rain';
export type TimeFormat = '12h' | '24h';

export interface AlertCity {
  name: string;
  lat: number;
  lon: number;
}

/** What the browser's push service hands the page, as sent by `PushSubscription.toJSON()`. */
export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** One subscribed device, as stored in the database. */
export interface StoredSubscription extends PushSubscriptionJSON {
  city: AlertCity;
  timeFormat: TimeFormat;
  createdAt: number;
  /** Epoch ms of the last alert of each kind, used for the cooldown. */
  lastSent: Partial<Record<AlertKind, number>>;
}

/** The slice of an Open-Meteo forecast the alert rules read. */
export interface ForecastSnapshot {
  /** The city's wall clock at observation time, e.g. "2026-09-11T15:15". */
  currentTime: string;
  currentCode: number;
  hourly: {
    time: string[];
    weather_code: number[];
    precipitation_probability: number[];
  };
}

export interface Alert {
  kind: AlertKind;
  title: string;
  body: string;
  /** Notifications sharing a tag replace each other instead of stacking. */
  tag: string;
}

export interface PushPayload {
  title: string;
  body: string;
  tag: string;
  url: string;
}

export type PushResult = { ok: true } | { ok: false; gone: boolean; status?: number };
