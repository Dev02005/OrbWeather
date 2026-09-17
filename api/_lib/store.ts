import { Redis } from '@upstash/redis';
import type { StoredSubscription } from './types.js';

export interface SubscriptionStore {
  all(): Promise<Map<string, StoredSubscription>>;
  get(id: string): Promise<StoredSubscription | null>;
  put(id: string, subscription: StoredSubscription): Promise<void>;
  remove(id: string): Promise<void>;
  count(): Promise<number>;
  /** Sets `key` for `ttlSeconds` only if it is unset; true if this call set it. */
  claim(key: string, ttlSeconds: number): Promise<boolean>;
}

/**
 * Every subscription lives in one Redis hash, so the whole list loads in a
 * single command. That keeps each 15-minute check to a handful of commands,
 * far inside the free tier however many devices subscribe.
 */
const SUBSCRIPTIONS_KEY = 'orbweather:subscriptions';
const CLAIM_PREFIX = 'orbweather:claim:';

export function upstashStore(redis: Redis): SubscriptionStore {
  return {
    async all() {
      const entries = await redis.hgetall<Record<string, StoredSubscription>>(SUBSCRIPTIONS_KEY);
      return new Map(Object.entries(entries ?? {}));
    },
    async get(id) {
      return (await redis.hget<StoredSubscription>(SUBSCRIPTIONS_KEY, id)) ?? null;
    },
    async put(id, subscription) {
      await redis.hset(SUBSCRIPTIONS_KEY, { [id]: subscription });
    },
    async remove(id) {
      await redis.hdel(SUBSCRIPTIONS_KEY, id);
    },
    async count() {
      return redis.hlen(SUBSCRIPTIONS_KEY);
    },
    async claim(key, ttlSeconds) {
      const result = await redis.set(`${CLAIM_PREFIX}${key}`, 1, { nx: true, ex: ttlSeconds });
      return result === 'OK';
    },
  };
}

/**
 * The Upstash console displays the bare endpoint ("name-123.upstash.io"), so
 * that is often what gets pasted. Accept it with or without the scheme.
 */
export function restUrl(raw: string): string {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, '');
}

/** Reads credentials under either Upstash's own names or Vercel's integration names. */
export function redisFromEnv(env: NodeJS.ProcessEnv = process.env): Redis | null {
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url: restUrl(url), token }) : null;
}

/** An in-process stand-in with the same behaviour, used by the tests. */
export function memoryStore(): SubscriptionStore & { data: Map<string, StoredSubscription> } {
  const data = new Map<string, StoredSubscription>();
  const claims = new Map<string, number>();

  return {
    data,
    async all() {
      return new Map(data);
    },
    async get(id) {
      return data.get(id) ?? null;
    },
    async put(id, subscription) {
      data.set(id, structuredClone(subscription));
    },
    async remove(id) {
      data.delete(id);
    },
    async count() {
      return data.size;
    },
    async claim(key, ttlSeconds) {
      const now = Date.now();
      const expires = claims.get(key);
      if (expires !== undefined && expires > now) return false;
      claims.set(key, now + ttlSeconds * 1000);
      return true;
    },
  };
}
