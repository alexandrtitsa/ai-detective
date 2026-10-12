import { getConnInfo } from '@hono/node-server/conninfo';
import type { MiddlewareHandler } from 'hono';

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 1000;

/** Фіксоване вікно на клієнта (за адресою зʼєднання, а не за спуфабельним X-Forwarded-For). */
export function rateLimit(limitPerMinute: number): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();

  return async (c, next) => {
    const now = Date.now();
    const key = getConnInfo(c).remote.address ?? 'unknown';

    if (buckets.size > MAX_TRACKED_CLIENTS) {
      for (const [id, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(id);
      }
    }

    const bucket = buckets.get(key);
    if (bucket === undefined || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else if (bucket.count >= limitPerMinute) {
      c.header('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return c.json({ error: { code: 'rate_limited' } }, 429);
    } else {
      bucket.count += 1;
    }

    await next();
  };
}
