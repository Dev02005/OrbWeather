import { createPushSender } from './push.js';
import { fetchForecast } from './forecast.js';
import { redisFromEnv, upstashStore } from './store.js';
import type { Deps } from './handlers.js';
import type { SendPush } from './push.js';

/**
 * Values pasted into a dashboard often pick up stray whitespace or the quotes
 * shown in a copied `.env` line. Either would silently break a key or URL.
 */
export function cleanEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/^(['"])(.*)\1$/, '$2').trim();
  return trimmed ? trimmed : undefined;
}

let cached: Deps | null = null;

/** Real dependencies, built once per function instance from environment variables. */
export function defaultDeps(): Deps {
  if (cached) return cached;

  const env = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, cleanEnv(value)])
  ) as NodeJS.ProcessEnv;

  const publicKey = env.VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;

  let sendPush: SendPush | null = null;
  if (publicKey && privateKey) {
    try {
      sendPush = createPushSender(publicKey, privateKey);
    } catch (err) {
      // Malformed keys are a configuration mistake; report "not configured"
      // rather than crashing every request.
      console.error('Invalid VAPID keys:', err);
    }
  }

  const redis = redisFromEnv(env);

  cached = {
    store: redis ? upstashStore(redis) : null,
    sendPush,
    fetchForecast,
    vapidPublicKey: sendPush ? publicKey : undefined,
    cronSecret: env.CRON_SECRET,
    now: Date.now,
  };
  return cached;
}
