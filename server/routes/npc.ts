import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { npcRephraseRequestSchema } from '../../src/shared/api/contracts/npc-contract';
import type { RephraseService } from '../lib/rephrase';
import { respondWithError } from '../lib/respond-with-error';

export function createNpcRoutes(service: RephraseService) {
  const routes = new Hono();

  routes.post(
    '/rephrase',
    bodyLimit({
      maxSize: 8 * 1024,
      onError: (c) => c.json({ error: { code: 'payload_too_large' } }, 413),
    }),
    async (c) => {
      const body: unknown = await c.req.json().catch(() => undefined);
      const parsed = npcRephraseRequestSchema.safeParse(body);
      if (!parsed.success) return c.json({ error: { code: 'bad_request' } }, 400);

      try {
        const statement = await service.rephrase(parsed.data, c.req.raw.signal);
        return c.json({ statement });
      } catch (error) {
        return respondWithError(c, error);
      }
    },
  );

  return routes;
}
