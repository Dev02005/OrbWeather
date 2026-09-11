import { decideAlert } from './alerts.js';
import { error, isAuthorized, json, readJson } from './http.js';
import { parseEndpoint, parseSubscribeRequest, subscriptionId } from './subscriptions.js';
import type { FetchForecast } from './forecast.js';
import type { SendPush } from './push.js';
import type { SubscriptionStore } from './store.js';
import type { ForecastSnapshot, StoredSubscription } from './types.js';

/** Keeps the service inside free-tier limits and bounds the damage of abuse. */
export const MAX_SUBSCRIPTIONS = 500;
const TEST_COOLDOWN_SECONDS = 30;
/** Longer than a check can run, shorter than the 15-minute schedule. */
const CHECK_LOCK_SECONDS = 60;
const FORECAST_CONCURRENCY = 8;
const APP_URL = '/';

/**
 * Everything the handlers touch from the outside world, passed in so the tests
 * can swap in fakes. `null` means that piece is not configured on the server.
 */
export interface Deps {
  store: SubscriptionStore | null;
  sendPush: SendPush | null;
  fetchForecast: FetchForecast;
  vapidPublicKey: string | undefined;
  cronSecret: string | undefined;
  now: () => number;
}

const notConfigured = () => error('Weather alerts are not set up on this server yet.', 503);

const endpointFrom = (body: unknown) =>
  parseEndpoint(typeof body === 'object' && body !== null ? (body as { endpoint?: unknown }).endpoint : undefined);

/** GET /api/push-key — the public half of the VAPID pair, needed to subscribe. */
export function handlePushKey(deps: Deps): Response {
  if (!deps.vapidPublicKey) return notConfigured();
  return json({ publicKey: deps.vapidPublicKey });
}

/** POST /api/subscribe — creates or refreshes this device's subscription. */
export async function handleSubscribe(request: Request, deps: Deps): Promise<Response> {
  const { store } = deps;
  if (!store || !deps.vapidPublicKey) return notConfigured();

  const body = await readJson(request);
  if (body === null) return error('Expected a small JSON body.', 400);

  const parsed = parseSubscribeRequest(body);
  if (!parsed.ok) return error(parsed.error, 400);

  const { subscription, city, timeFormat } = parsed.value;
  const id = subscriptionId(subscription.endpoint);
  const existing = await store.get(id);

  if (!existing && (await store.count()) >= MAX_SUBSCRIPTIONS) {
    return error('Weather alerts are at capacity right now. Please try again later.', 503);
  }

  const movedCity = existing && (existing.city.lat !== city.lat || existing.city.lon !== city.lon);

  await store.put(id, {
    ...subscription,
    city,
    timeFormat,
    createdAt: existing?.createdAt ?? deps.now(),
    // A new city starts with a clean slate, so its first alert is not held
    // back by a cooldown earned somewhere else.
    lastSent: movedCity ? {} : (existing?.lastSent ?? {}),
  });

  return json({ ok: true, city: city.name }, existing ? 200 : 201);
}

/** POST /api/unsubscribe — forgets this device. */
export async function handleUnsubscribe(request: Request, deps: Deps): Promise<Response> {
  if (!deps.store) return notConfigured();

  const endpoint = endpointFrom(await readJson(request));
  if (!endpoint.ok) return error(endpoint.error, 400);

  await deps.store.remove(subscriptionId(endpoint.value));
  return json({ ok: true });
}

/** POST /api/test-push — sends a confirmation to a device that is already subscribed. */
export async function handleTestPush(request: Request, deps: Deps): Promise<Response> {
  const { store, sendPush } = deps;
  if (!store || !sendPush) return notConfigured();

  const endpoint = endpointFrom(await readJson(request));
  if (!endpoint.ok) return error(endpoint.error, 400);

  const id = subscriptionId(endpoint.value);
  const subscription = await store.get(id);
  if (!subscription) return error('This device is not subscribed. Turn alerts on first.', 404);

  if (!(await store.claim(`test:${id}`, TEST_COOLDOWN_SECONDS))) {
    return error('Please wait a few seconds before sending another test.', 429);
  }

  const result = await sendPush(
    subscription,
    {
      title: '✅ OrbWeather alerts are on',
      body: `You'll hear about severe weather and incoming rain in ${subscription.city.name}.`,
      tag: 'orbweather-test',
      url: APP_URL,
    },
    { ttlSeconds: 60, urgent: true }
  );

  if (result.ok) return json({ ok: true });
  if (result.gone) {
    await store.remove(id);
    return error('This device’s subscription has expired. Turn alerts off and on again.', 410);
  }
  return error('The push service did not accept the notification. Try again shortly.', 502);
}

async function forEachLimit<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await task(items[next++]);
  });
  await Promise.all(workers);
}

/**
 * GET|POST /api/check-weather — the scheduled job. Fetches each watched place
 * once, decides per device whether to alert, and prunes dead subscriptions.
 * The JSON summary it returns shows up in the scheduler's run history.
 */
export async function handleCheckWeather(request: Request, deps: Deps): Promise<Response> {
  if (!deps.cronSecret) return notConfigured();
  if (!isAuthorized(request, deps.cronSecret)) return error('Unauthorized.', 401);

  const { store, sendPush } = deps;
  if (!store || !sendPush) return notConfigured();

  // Two overlapping runs could both decide to alert before either records it.
  if (!(await store.claim('check-weather', CHECK_LOCK_SECONDS))) {
    return json({ skipped: 'A check is already running.' });
  }

  const subscriptions = await store.all();
  const now = deps.now();

  // Devices within about a kilometre share one forecast request.
  const byPlace = new Map<string, [string, StoredSubscription][]>();
  for (const entry of subscriptions) {
    const { lat, lon } = entry[1].city;
    const place = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const group = byPlace.get(place);
    if (group) group.push(entry);
    else byPlace.set(place, [entry]);
  }

  const summary = {
    devices: subscriptions.size,
    places: byPlace.size,
    sent: 0,
    removed: 0,
    failed: 0,
    forecastErrors: 0,
  };

  await forEachLimit([...byPlace.values()], FORECAST_CONCURRENCY, async group => {
    const { lat, lon } = group[0][1].city;

    let forecast: ForecastSnapshot;
    try {
      forecast = await deps.fetchForecast(lat, lon);
    } catch (err) {
      summary.forecastErrors++;
      console.error(`Forecast failed for ${lat},${lon}:`, err);
      return;
    }

    for (const [id, subscription] of group) {
      const lastSent = subscription.lastSent ?? {};
      const alert = decideAlert(subscription.city.name, forecast, lastSent, now, subscription.timeFormat);
      if (!alert) continue;

      const result = await sendPush(
        subscription,
        { title: alert.title, body: alert.body, tag: alert.tag, url: APP_URL },
        { urgent: alert.kind === 'severe' }
      );

      if (result.ok) {
        summary.sent++;
        await store.put(id, { ...subscription, lastSent: { ...lastSent, [alert.kind]: now } });
      } else if (result.gone) {
        summary.removed++;
        await store.remove(id);
      } else {
        summary.failed++;
        console.error(`Push failed for ${id} with status ${result.status ?? 'unknown'}`);
      }
    }
  });

  return json(summary);
}
