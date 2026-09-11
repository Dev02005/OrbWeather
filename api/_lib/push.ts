import webpush from 'web-push';
import type { PushPayload, PushResult, PushSubscriptionJSON } from './types.js';

/** Identifies the sender to the push services, as the VAPID spec requires. */
const VAPID_SUBJECT = 'https://orb-weather.vercel.app';

export type SendPush = (
  subscription: PushSubscriptionJSON,
  payload: PushPayload,
  options?: { ttlSeconds?: number; urgent?: boolean }
) => Promise<PushResult>;

export function createPushSender(publicKey: string, privateKey: string): SendPush {
  webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);

  return async (subscription, payload, options = {}) => {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload), {
        // A weather alert is worthless once it's stale, so let the push service
        // drop it rather than deliver it hours late to a phone that was off.
        TTL: options.ttlSeconds ?? 2 * 60 * 60,
        urgency: options.urgent ? 'high' : 'normal',
        timeout: 8000,
      });
      return { ok: true };
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      // 404 and 410 mean the browser has dropped this subscription for good.
      return { ok: false, gone: status === 404 || status === 410, status };
    }
  };
}
