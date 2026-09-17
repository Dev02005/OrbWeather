import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleCheckWeather,
  handlePushKey,
  handleSubscribe,
  handleTestPush,
  handleUnsubscribe,
  MAX_SUBSCRIPTIONS,
} from './handlers.js';
import { memoryStore, restUrl } from './store.js';
import { parseSubscribeRequest, subscriptionId } from './subscriptions.js';
import { cleanEnv } from './deps.js';
import type { Deps } from './handlers.js';
import type { ForecastSnapshot, PushResult } from './types.js';

const SECRET = 'test-secret-value';
const NOW = Date.UTC(2026, 8, 11, 10, 0);

const endpoint = (n = 1) => `https://fcm.googleapis.com/fcm/send/device-${n}`;
const subscription = (n = 1) => ({
  endpoint: endpoint(n),
  keys: { p256dh: 'B' + 'A'.repeat(86), auth: 'A'.repeat(22) },
});
const hyderabad = { name: 'Hyderabad', lat: 17.385, lon: 78.4867 };

const calm: ForecastSnapshot = {
  currentTime: '2026-09-11T10:00',
  currentCode: 1,
  hourly: {
    time: ['2026-09-11T10:00', '2026-09-11T11:00', '2026-09-11T12:00'],
    weather_code: [1, 1, 1],
    precipitation_probability: [0, 0, 0],
  },
};
const stormy: ForecastSnapshot = { ...calm, currentCode: 95 };

let store: ReturnType<typeof memoryStore>;
let deps: Deps;
let sent: { endpoint: string; title: string }[];
let pushResult: PushResult;

beforeEach(() => {
  store = memoryStore();
  sent = [];
  pushResult = { ok: true };
  deps = {
    store,
    sendPush: vi.fn(async (sub, payload) => {
      sent.push({ endpoint: sub.endpoint, title: payload.title });
      return pushResult;
    }),
    fetchForecast: vi.fn(async () => calm),
    vapidPublicKey: 'public-key',
    cronSecret: SECRET,
    now: () => NOW,
  };
});

const post = (path: string, body: unknown) =>
  new Request(`https://orb-weather.vercel.app${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const cron = (auth?: string, query = '') =>
  new Request(`https://orb-weather.vercel.app/api/check-weather${query}`, {
    headers: auth ? { authorization: auth } : {},
  });

async function subscribeDevice(n = 1, city = hyderabad) {
  return handleSubscribe(post('/api/subscribe', { subscription: subscription(n), city }), deps);
}

describe('push-key', () => {
  it('returns the public key', async () => {
    expect(await handlePushKey(deps).json()).toEqual({ publicKey: 'public-key' });
  });

  it('reports 503 when the server is not configured', () => {
    expect(handlePushKey({ ...deps, vapidPublicKey: undefined }).status).toBe(503);
  });
});

describe('subscribe', () => {
  it('stores a new device', async () => {
    const res = await subscribeDevice();
    expect(res.status).toBe(201);
    const stored = store.data.get(subscriptionId(endpoint()));
    expect(stored?.city.name).toBe('Hyderabad');
    expect(stored?.timeFormat).toBe('12h');
    expect(stored?.createdAt).toBe(NOW);
  });

  it('is idempotent, keeping cooldown history for the same city', async () => {
    await subscribeDevice();
    const id = subscriptionId(endpoint());
    await store.put(id, { ...store.data.get(id)!, lastSent: { severe: NOW - 1000 } });

    const res = await subscribeDevice();
    expect(res.status).toBe(200);
    expect(store.data.size).toBe(1);
    expect(store.data.get(id)?.lastSent.severe).toBe(NOW - 1000);
  });

  it('resets cooldowns when the device switches city', async () => {
    await subscribeDevice();
    const id = subscriptionId(endpoint());
    await store.put(id, { ...store.data.get(id)!, lastSent: { severe: NOW - 1000 } });

    await subscribeDevice(1, { name: 'Chennai', lat: 13.08, lon: 80.27 });
    expect(store.data.get(id)?.lastSent).toEqual({});
    expect(store.data.get(id)?.city.name).toBe('Chennai');
  });

  it('rejects malformed JSON and invalid payloads', async () => {
    const bad = new Request('https://x/api/subscribe', { method: 'POST', body: '{nope' });
    expect((await handleSubscribe(bad, deps)).status).toBe(400);
    expect((await handleSubscribe(post('/api/subscribe', { city: hyderabad }), deps)).status).toBe(400);
  });

  it('refuses new devices at capacity, but still refreshes existing ones', async () => {
    await subscribeDevice(1);
    vi.spyOn(store, 'count').mockResolvedValue(MAX_SUBSCRIPTIONS);
    expect((await subscribeDevice(2)).status).toBe(503);
    expect((await subscribeDevice(1)).status).toBe(200);
  });

  it('reports 503 when storage is not configured', async () => {
    deps.store = null;
    expect((await subscribeDevice()).status).toBe(503);
  });
});

describe('subscription validation', () => {
  const base = { subscription: subscription(), city: hyderabad };

  it('only accepts endpoints on known push services', () => {
    for (const url of [
      'https://fcm.googleapis.com/fcm/send/abc',
      'https://updates.push.services.mozilla.com/wpush/v2/abc',
      'https://web.push.apple.com/abc',
      'https://wns2-par02p.notify.windows.com/w/?token=abc',
    ]) {
      const r = parseSubscribeRequest({ ...base, subscription: { ...subscription(), endpoint: url } });
      expect(r.ok, url).toBe(true);
    }
  });

  it('rejects endpoints that would let the server be pointed anywhere', () => {
    for (const url of [
      'https://evil.example.com/collect',
      'http://fcm.googleapis.com/fcm/send/abc', // not https
      'https://fcm.googleapis.com.evil.com/x', // lookalike host
      'https://169.254.169.254/latest/meta-data',
      'not a url',
    ]) {
      const r = parseSubscribeRequest({ ...base, subscription: { ...subscription(), endpoint: url } });
      expect(r.ok, url).toBe(false);
    }
  });

  it('rejects bad keys and out-of-range coordinates', () => {
    const badKeys = { ...subscription(), keys: { p256dh: 'short', auth: 'A'.repeat(22) } };
    expect(parseSubscribeRequest({ ...base, subscription: badKeys }).ok).toBe(false);
    expect(parseSubscribeRequest({ ...base, city: { ...hyderabad, lat: 91 } }).ok).toBe(false);
    expect(parseSubscribeRequest({ ...base, city: { ...hyderabad, lon: Number.NaN } }).ok).toBe(false);
    expect(parseSubscribeRequest({ ...base, city: { ...hyderabad, name: ' ' } }).ok).toBe(false);
  });
});

describe('unsubscribe', () => {
  it('removes the device', async () => {
    await subscribeDevice();
    const res = await handleUnsubscribe(post('/api/unsubscribe', { endpoint: endpoint() }), deps);
    expect(res.status).toBe(200);
    expect(store.data.size).toBe(0);
  });
});

describe('test-push', () => {
  it('sends a confirmation to a subscribed device', async () => {
    await subscribeDevice();
    const res = await handleTestPush(post('/api/test-push', { endpoint: endpoint() }), deps);
    expect(res.status).toBe(200);
    expect(sent[0].title).toMatch(/alerts are on/);
  });

  it('refuses devices that are not subscribed', async () => {
    const res = await handleTestPush(post('/api/test-push', { endpoint: endpoint() }), deps);
    expect(res.status).toBe(404);
  });

  it('rate-limits repeated tests', async () => {
    await subscribeDevice();
    await handleTestPush(post('/api/test-push', { endpoint: endpoint() }), deps);
    const res = await handleTestPush(post('/api/test-push', { endpoint: endpoint() }), deps);
    expect(res.status).toBe(429);
    expect(sent).toHaveLength(1);
  });

  it('removes an expired subscription and says so', async () => {
    await subscribeDevice();
    pushResult = { ok: false, gone: true, status: 410 };
    const res = await handleTestPush(post('/api/test-push', { endpoint: endpoint() }), deps);
    expect(res.status).toBe(410);
    expect(store.data.size).toBe(0);
  });
});

describe('check-weather', () => {
  it('rejects requests without the secret', async () => {
    expect((await handleCheckWeather(cron(), deps)).status).toBe(401);
    expect((await handleCheckWeather(cron('Bearer wrong'), deps)).status).toBe(401);
    expect((await handleCheckWeather(cron(undefined, '?key=wrong'), deps)).status).toBe(401);
  });

  it('accepts the secret as a bearer header or a query key', async () => {
    expect((await handleCheckWeather(cron(`Bearer ${SECRET}`), deps)).status).toBe(200);
    store = memoryStore(); // fresh lock
    deps.store = store;
    expect((await handleCheckWeather(cron(undefined, `?key=${SECRET}`), deps)).status).toBe(200);
  });

  it('sends nothing on a calm day', async () => {
    await subscribeDevice();
    const summary = await (await handleCheckWeather(cron(`Bearer ${SECRET}`), deps)).json();
    expect(summary).toMatchObject({ devices: 1, sent: 0 });
  });

  it('alerts subscribed devices and records the cooldown', async () => {
    await subscribeDevice();
    deps.fetchForecast = vi.fn(async () => stormy);

    const summary = await (await handleCheckWeather(cron(`Bearer ${SECRET}`), deps)).json();
    expect(summary).toMatchObject({ devices: 1, sent: 1 });
    expect(sent[0].title).toBe('⛈️ Thunderstorm in Hyderabad');
    expect(store.data.get(subscriptionId(endpoint()))?.lastSent.severe).toBe(NOW);
  });

  it('fetches each place once, however many devices watch it', async () => {
    await subscribeDevice(1);
    await subscribeDevice(2);
    await subscribeDevice(3, { name: 'Chennai', lat: 13.08, lon: 80.27 });
    await handleCheckWeather(cron(`Bearer ${SECRET}`), deps);
    expect(deps.fetchForecast).toHaveBeenCalledTimes(2);
  });

  it('prunes subscriptions the push service reports as gone', async () => {
    await subscribeDevice();
    deps.fetchForecast = vi.fn(async () => stormy);
    pushResult = { ok: false, gone: true, status: 410 };

    const summary = await (await handleCheckWeather(cron(`Bearer ${SECRET}`), deps)).json();
    expect(summary).toMatchObject({ removed: 1 });
    expect(store.data.size).toBe(0);
  });

  it('keeps going when one place’s forecast fails', async () => {
    await subscribeDevice(1);
    await subscribeDevice(2, { name: 'Chennai', lat: 13.08, lon: 80.27 });
    deps.fetchForecast = vi.fn(async (lat: number) => {
      if (lat > 15) throw new Error('boom');
      return stormy;
    });

    const summary = await (await handleCheckWeather(cron(`Bearer ${SECRET}`), deps)).json();
    expect(summary).toMatchObject({ forecastErrors: 1, sent: 1 });
  });

  it('skips a run that overlaps one already in progress', async () => {
    await handleCheckWeather(cron(`Bearer ${SECRET}`), deps);
    const second = await (await handleCheckWeather(cron(`Bearer ${SECRET}`), deps)).json();
    expect(second).toHaveProperty('skipped');
  });
});

describe('restUrl', () => {
  it('accepts the bare endpoint the Upstash console displays', () => {
    expect(restUrl('noble-insect-1.upstash.io')).toBe('https://noble-insect-1.upstash.io');
  });

  it('leaves a full URL alone, minus any trailing slash', () => {
    expect(restUrl('https://noble-insect-1.upstash.io')).toBe('https://noble-insect-1.upstash.io');
    expect(restUrl('https://noble-insect-1.upstash.io/')).toBe('https://noble-insect-1.upstash.io');
  });
});

describe('cleanEnv', () => {
  it('strips whitespace and the quotes a copied .env line carries', () => {
    expect(cleanEnv('  "https://x.upstash.io"  ')).toBe('https://x.upstash.io');
    expect(cleanEnv("'token'")).toBe('token');
    expect(cleanEnv('plain')).toBe('plain');
    expect(cleanEnv('   ')).toBeUndefined();
    expect(cleanEnv(undefined)).toBeUndefined();
  });
});
