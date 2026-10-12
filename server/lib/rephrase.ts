import { npcModelJsonSchema } from '../../src/shared/api/contracts/npc-model-schema';
import {
  npcRephraseResponseSchema,
  type NpcRephraseRequest,
} from '../../src/shared/api/contracts/npc-contract';
import { retry } from '../../src/shared/lib/retry';
import { buildMessages } from './build-prompt';
import { UpstreamError } from './errors';
import { isFaithful } from './is-faithful';
import type { OpenRouterClient } from './openrouter-client';

export interface RephraseOptions {
  readonly maxAttempts: number;
  readonly totalTimeoutMs: number;
  readonly baseDelayMs?: number;
}

export interface RephraseService {
  rephrase(request: NpcRephraseRequest, signal: AbortSignal): Promise<string>;
}

function parseStatement(raw: string, original: string): string {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new UpstreamError('invalid_output', 'Модель повернула не JSON', {
      retryable: true,
      cause: error,
    });
  }

  const parsed = npcRephraseResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new UpstreamError('invalid_output', 'Відповідь моделі не пройшла схему', {
      retryable: true,
    });
  }
  if (!isFaithful(original, parsed.data.statement)) {
    throw new UpstreamError('invalid_output', 'Модель змінила факти', { retryable: true });
  }
  return parsed.data.statement;
}

const isRetryable = (error: unknown): boolean => error instanceof UpstreamError && error.retryable;
const retryAfterOf = (error: unknown): number | undefined =>
  error instanceof UpstreamError ? error.retryAfterMs : undefined;

export function createRephraseService(
  client: OpenRouterClient,
  options: RephraseOptions,
): RephraseService {
  const { maxAttempts, totalTimeoutMs, baseDelayMs = 300 } = options;

  return {
    async rephrase(request, clientSignal) {
      const totalSignal = AbortSignal.timeout(totalTimeoutMs);
      const signal = AbortSignal.any([clientSignal, totalSignal]);
      const messages = buildMessages(request);

      try {
        return await retry(
          async () => {
            const raw = await client.complete({
              name: 'npc_statement',
              schema: npcModelJsonSchema,
              messages,
              signal,
            });
            return parseStatement(raw, request.statement);
          },
          {
            attempts: maxAttempts,
            baseDelayMs,
            maxDelayMs: 2000,
            signal,
            shouldRetry: isRetryable,
            getDelayMs: retryAfterOf,
          },
        );
      } catch (error) {
        if (!clientSignal.aborted && totalSignal.aborted) {
          throw new UpstreamError('timeout', 'Загальний дедлайн AI вичерпано', {
            retryable: false,
            cause: error,
          });
        }
        throw error;
      }
    },
  };
}
