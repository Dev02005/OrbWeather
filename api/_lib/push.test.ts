import { describe, it, expect, afterEach, vi } from 'vitest';
import { createECDH, createPublicKey, randomBytes, verify } from 'node:crypto';
import webpush from 'web-push';
// @ts-expect-error — http_ece ships without type declarations
import ece from 'http_ece';
import { createPushSender } from './push.js';

/** A stand-in for what a real browser generates when it subscribes. */
function simulatedBrowser() {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = randomBytes(16);
  return {
    ecdh,
    auth,
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/simulated-device',
      keys: { p256dh: ecdh.getPublicKey().toString('base64url'), auth: auth.toString('base64url') },
    },
  };
}

afterEach(() => vi.restoreAllMocks());

describe('end-to-end encryption and signing', () => {
  // generateRequestDetails runs everything sendNotification does except the
  // network call, so the phone's side of the exchange can be checked for real.
  it('produces a request only the subscribed device can decrypt', () => {
    const { publicKey, privateKey } = webpush.generateVAPIDKeys();
    const browser = simulatedBrowser();
    const payload = JSON.stringify({ title: '⛈️ Thunderstorm in Hyderabad', body: 'Happening now.' });

    const request = webpush.generateRequestDetails(browser.subscription, payload, {
      vapidDetails: { subject: 'https://orb-weather.vercel.app', publicKey, privateKey },
      TTL: 7200,
      urgency: 'high',
    });

    expect(request.method).toBe('POST');
    expect(request.endpoint).toBe(browser.subscription.endpoint);
    expect(request.headers['Content-Encoding']).toBe('aes128gcm');
    expect(request.headers.TTL).toBe(7200);
    expect(request.headers.Urgency).toBe('high');

    const decrypted = ece.decrypt(request.body, {
      version: 'aes128gcm',
      privateKey: browser.ecdh,
      authSecret: browser.auth,
    });
    expect(decrypted.toString('utf8')).toBe(payload);
  });

  it('signs with VAPID so the push service can verify the sender', () => {
    const { publicKey, privateKey } = webpush.generateVAPIDKeys();
    const { Authorization } = webpush.getVapidHeaders(
      'https://fcm.googleapis.com',
      'https://orb-weather.vercel.app',
      publicKey,
      privateKey,
      'aes128gcm'
    );

    const [, token, key] = /^vapid t=([^,]+), k=(.+)$/.exec(Authorization)!;
    expect(key).toBe(publicKey);

    const [header, claims, signature] = token.split('.');
    const pub = Buffer.from(publicKey, 'base64url');
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: pub.subarray(1, 33).toString('base64url'),
      y: pub.subarray(33, 65).toString('base64url'),
    };
    const valid = verify(
      'sha256',
      Buffer.from(`${header}.${claims}`),
      { key: createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' },
      Buffer.from(signature, 'base64url')
    );
    expect(valid).toBe(true);
    expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toMatchObject({
      aud: 'https://fcm.googleapis.com',
      sub: 'https://orb-weather.vercel.app',
    });
  });
});

describe('createPushSender', () => {
  const { publicKey, privateKey } = webpush.generateVAPIDKeys();
  const { subscription } = simulatedBrowser();
  const payload = { title: 't', body: 'b', tag: 'x', url: '/' };

  it('reports success', async () => {
    vi.spyOn(webpush, 'sendNotification').mockResolvedValue({ statusCode: 201, body: '', headers: {} });
    expect(await createPushSender(publicKey, privateKey)(subscription, payload)).toEqual({ ok: true });
  });

  it('passes a stale-alert TTL and urgency through', async () => {
    const spy = vi.spyOn(webpush, 'sendNotification').mockResolvedValue({ statusCode: 201, body: '', headers: {} });
    await createPushSender(publicKey, privateKey)(subscription, payload, { urgent: true });
    expect(spy.mock.calls[0][2]).toMatchObject({ TTL: 7200, urgency: 'high' });
  });

  it('treats 404 and 410 as a subscription that is gone for good', async () => {
    for (const statusCode of [404, 410]) {
      vi.spyOn(webpush, 'sendNotification').mockRejectedValueOnce(
        new webpush.WebPushError('gone', statusCode, {}, '', subscription.endpoint)
      );
      expect(await createPushSender(publicKey, privateKey)(subscription, payload)).toEqual({
        ok: false,
        gone: true,
        status: statusCode,
      });
    }
  });

  it('treats other failures as temporary, keeping the subscription', async () => {
    vi.spyOn(webpush, 'sendNotification').mockRejectedValueOnce(
      new webpush.WebPushError('busy', 503, {}, '', subscription.endpoint)
    );
    const result = await createPushSender(publicKey, privateKey)(subscription, payload);
    expect(result).toEqual({ ok: false, gone: false, status: 503 });
  });

  it('rejects malformed VAPID keys up front', () => {
    expect(() => createPushSender('not-a-key', privateKey)).toThrow();
  });
});
