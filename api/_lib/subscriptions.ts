import { createHash } from 'node:crypto';
import type { AlertCity, PushSubscriptionJSON, TimeFormat } from './types.js';

/**
 * Hosts run by the browser vendors' push services. Only these are accepted,
 * because the server later POSTs to whatever endpoint is stored — without the
 * allowlist, anyone could make it send requests to an arbitrary URL.
 */
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/, // Chrome, Edge on Android, Opera, Samsung Internet
  /^android\.googleapis\.com$/, // legacy Chrome endpoints
  /(^|\.)push\.services\.mozilla\.com$/, // Firefox
  /^web\.push\.apple\.com$/, // Safari, including installed iOS web apps
  /(^|\.)notify\.windows\.com$/, // Edge on Windows
];

const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export interface SubscribeRequest {
  subscription: PushSubscriptionJSON;
  city: AlertCity;
  timeFormat: TimeFormat;
}

/** A short, stable key for a device, derived from its endpoint. */
export function subscriptionId(endpoint: string) {
  return createHash('sha256').update(endpoint).digest('hex').slice(0, 32);
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export function parseEndpoint(value: unknown): Parsed<string> {
  if (typeof value !== 'string' || value.length > 1024) {
    return { ok: false, error: 'Invalid push endpoint.' };
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: 'Invalid push endpoint.' };
  }
  if (url.protocol !== 'https:' || !PUSH_HOSTS.some(host => host.test(url.hostname))) {
    return { ok: false, error: 'Push endpoint is not from a recognised push service.' };
  }
  return { ok: true, value };
}

function parseSubscription(value: unknown): Parsed<PushSubscriptionJSON> {
  if (!isObject(value) || !isObject(value.keys)) {
    return { ok: false, error: 'Missing push subscription.' };
  }
  const endpoint = parseEndpoint(value.endpoint);
  if (!endpoint.ok) return endpoint;

  const { p256dh, auth } = value.keys;
  // p256dh is a 65-byte public key and auth a 16-byte secret, base64url-encoded.
  const validKey = (k: unknown, min: number, max: number) =>
    typeof k === 'string' && k.length >= min && k.length <= max && BASE64URL.test(k);
  if (!validKey(p256dh, 80, 100) || !validKey(auth, 16, 32)) {
    return { ok: false, error: 'Invalid push subscription keys.' };
  }

  return {
    ok: true,
    value: { endpoint: endpoint.value, keys: { p256dh: p256dh as string, auth: auth as string } },
  };
}

function parseCity(value: unknown): Parsed<AlertCity> {
  if (!isObject(value)) return { ok: false, error: 'Missing city.' };
  const { name, lat, lon } = value;

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
    return { ok: false, error: 'Invalid city name.' };
  }
  const inRange = (n: unknown, limit: number): n is number =>
    typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= limit;
  if (!inRange(lat, 90) || !inRange(lon, 180)) {
    return { ok: false, error: 'Invalid city coordinates.' };
  }

  return { ok: true, value: { name: name.trim(), lat, lon } };
}

export function parseSubscribeRequest(body: unknown): Parsed<SubscribeRequest> {
  if (!isObject(body)) return { ok: false, error: 'Expected a JSON object.' };

  const subscription = parseSubscription(body.subscription);
  if (!subscription.ok) return subscription;

  const city = parseCity(body.city);
  if (!city.ok) return city;

  const timeFormat: TimeFormat = body.timeFormat === '24h' ? '24h' : '12h';

  return { ok: true, value: { subscription: subscription.value, city: city.value, timeFormat } };
}
