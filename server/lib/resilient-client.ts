import { retry } from '../../src/shared/lib/retry';
import { UpstreamError } from './errors';
import type { OpenRouterClient } from './openrouter-client';

interface ResilienceOptions {
  readonly maxAttempts: number;
  readonly baseDelayMs?: number;
}

/** Декоратор: повторює лише тимчасові збої апстріму (429, 5xx, мережа, таймаут). */
export function withRetries(
  client: OpenRouterClient,
  options: ResilienceOptions,
): OpenRouterClient {
  const { maxAttempts, baseDelayMs = 300 } = options;

  return {
    complete: (request) =>
      retry(() => client.complete(request), {
        attempts: maxAttempts,
        baseDelayMs,
        maxDelayMs: 2000,
        signal: request.signal,
        shouldRetry: (error) => error instanceof UpstreamError && error.retryable,
        getDelayMs: (error) => (error instanceof UpstreamError ? error.retryAfterMs : undefined),
      }),
  };
}
