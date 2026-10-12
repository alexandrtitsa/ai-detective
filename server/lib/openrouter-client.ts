import { z } from 'zod';
import type { ServerConfig } from '../config';
import { UpstreamError } from './errors';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface ChatMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface CompleteRequest {
  /** Назва JSON-схеми для response_format */
  readonly name: string;
  readonly schema: Record<string, unknown>;
  readonly messages: readonly ChatMessage[];
  readonly signal: AbortSignal;
  /** Перевизначення для важчих запитів (генерація справ) */
  readonly model?: string | undefined;
  readonly timeoutMs?: number | undefined;
  readonly maxTokens?: number | undefined;
  readonly temperature?: number | undefined;
}

export interface OpenRouterClient {
  /** Одна спроба. Повтори й валідацію робить виклик вище. Повертає JSON-рядок від моделі. */
  complete(request: CompleteRequest): Promise<string>;
}

const completionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
});

function parseRetryAfter(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds * 1000 : undefined;
}

async function toHttpError(response: Response): Promise<UpstreamError> {
  const { status } = response;
  const detail = (await response.text().catch(() => '')).slice(0, 200); // лише для логів сервера
  const message = `OpenRouter responded ${String(status)}: ${detail}`;

  if (status === 401 || status === 402 || status === 403) {
    return new UpstreamError('auth', message, { retryable: false }); // ключ або баланс
  }
  if (status === 429) {
    const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
    return new UpstreamError('rate_limited', message, { retryable: true, retryAfterMs });
  }
  if (status === 408) return new UpstreamError('timeout', message, { retryable: true });
  if (status >= 500) return new UpstreamError('unavailable', message, { retryable: true });
  return new UpstreamError('rejected', message, { retryable: false });
}

export function createOpenRouterClient(config: ServerConfig): OpenRouterClient {
  return {
    async complete(request) {
      const { name, schema, messages, signal: callerSignal } = request;
      const signal = AbortSignal.any([
        callerSignal,
        AbortSignal.timeout(request.timeoutMs ?? config.AI_ATTEMPT_TIMEOUT_MS),
      ]);

      let response: Response;
      try {
        response = await fetch(ENDPOINT, {
          method: 'POST',
          signal,
          headers: {
            Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Title': 'AI Detective',
          },
          body: JSON.stringify({
            model: request.model ?? config.OPENROUTER_MODEL,
            messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 300,
            response_format: {
              type: 'json_schema',
              json_schema: { name, strict: true, schema },
            },
            // Лише ендпоінти, що підтримують structured outputs
            provider: { require_parameters: true },
          }),
        });
      } catch (error) {
        if (callerSignal.aborted) throw error; // скасовано зверху: не збій апстріму
        const timedOut = error instanceof Error && error.name === 'TimeoutError';
        throw new UpstreamError(timedOut ? 'timeout' : 'network', 'OpenRouter request failed', {
          retryable: true,
          cause: error,
        });
      }

      if (!response.ok) throw await toHttpError(response);

      const json: unknown = await response.json().catch(() => undefined);
      const parsed = completionSchema.safeParse(json);
      const content = parsed.success ? parsed.data.choices[0]?.message.content : undefined;

      if (content === undefined || content === null || content === '') {
        throw new UpstreamError('invalid_output', 'Порожня або некоректна відповідь моделі', {
          retryable: true,
        });
      }
      return content;
    },
  };
}
