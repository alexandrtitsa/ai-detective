import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { caseGenerationRequestSchema } from '../../src/shared/api/contracts/case-contract';
import type { CaseGenerator } from '../lib/case-generator';
import { respondWithError } from '../lib/respond-with-error';

export function createCaseRoutes(generator: CaseGenerator) {
  const routes = new Hono();

  routes.post(
    '/generate',
    bodyLimit({
      maxSize: 2 * 1024,
      onError: (c) => c.json({ error: { code: 'payload_too_large' } }, 413),
    }),
    async (c) => {
      const body: unknown = await c.req.json().catch(() => undefined);
      const parsed = caseGenerationRequestSchema.safeParse(body);
      if (!parsed.success) return c.json({ error: { code: 'bad_request' } }, 400);

      try {
        const blueprint = await generator.generate(parsed.data, c.req.raw.signal);
        return c.json({ blueprint });
      } catch (error) {
        return respondWithError(c, error);
      }
    },
  );

  return routes;
}
