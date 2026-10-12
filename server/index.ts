import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { loadConfig } from './config';
import { createCaseGenerator } from './lib/case-generator';
import { createOpenRouterClient } from './lib/openrouter-client';
import { rateLimit } from './lib/rate-limit';
import { createRephraseService } from './lib/rephrase';
import { withRetries } from './lib/resilient-client';
import { createCaseRoutes } from './routes/case';
import { createNpcRoutes } from './routes/npc';

const config = loadConfig();
const client = createOpenRouterClient(config);

const rephraseService = createRephraseService(client, {
  maxAttempts: config.AI_MAX_ATTEMPTS,
  totalTimeoutMs: config.AI_TOTAL_TIMEOUT_MS,
});

const caseGenerator = createCaseGenerator(
  withRetries(client, { maxAttempts: config.AI_MAX_ATTEMPTS }),
  {
    maxAttempts: config.CASE_MAX_ATTEMPTS,
    attemptTimeoutMs: config.CASE_ATTEMPT_TIMEOUT_MS,
    totalTimeoutMs: config.CASE_TOTAL_TIMEOUT_MS,
    model: config.OPENROUTER_CASE_MODEL,
  },
);

const app = new Hono();

app.use(logger());
app.use('/api/*', secureHeaders(), rateLimit(config.RATE_LIMIT_PER_MINUTE));
// Генерація дорога й повільна: окремий, суворіший ліміт
app.use('/api/case/*', rateLimit(config.CASE_RATE_LIMIT_PER_MINUTE));
app.get('/api/health', (c) => c.json({ ok: true }));
app.route('/api/npc', createNpcRoutes(rephraseService));
app.route('/api/case', createCaseRoutes(caseGenerator));

serve({ fetch: app.fetch, port: config.PORT }, ({ port }) => {
  console.log(`API: http://localhost:${String(port)}`);
});
