import type { Context } from 'hono';
import { UpstreamError } from './errors';

export function respondWithError(c: Context, error: unknown) {
  if (c.req.raw.signal.aborted) return c.body(null, 204); // клієнт сам відмовився чекати

  if (error instanceof UpstreamError) {
    console.error(`[ai] ${error.failure}: ${error.message}`);

    switch (error.failure) {
      case 'auth':
        return c.json({ error: { code: 'ai_unavailable' } }, 503);
      case 'timeout':
        return c.json({ error: { code: 'timeout' } }, 504);
      case 'invalid_output':
        return c.json({ error: { code: 'invalid_output' } }, 502);
      default:
        return c.json({ error: { code: 'upstream_failed' } }, 502);
    }
  }

  console.error('[ai] unexpected error', error);
  return c.json({ error: { code: 'internal' } }, 500);
}
