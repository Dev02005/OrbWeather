import { timingSafeEqual } from 'node:crypto';

const MAX_BODY_BYTES = 4096;

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export const error = (message: string, status: number) => json({ error: message }, status);

/** Parses a small JSON body, or returns null if it is too large or malformed. */
export async function readJson(request: Request): Promise<unknown | null> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return null;

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Accepts the secret as `Authorization: Bearer <secret>` (what cron-job.org and
 * Vercel Cron send) or as `?key=<secret>` for schedulers that cannot set headers.
 */
export function isAuthorized(request: Request, secret: string | undefined) {
  if (!secret) return false;

  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ') && safeEqual(header.slice(7), secret)) return true;

  const key = new URL(request.url).searchParams.get('key');
  return key !== null && safeEqual(key, secret);
}
