import { caseModelJsonSchema } from '../../src/shared/api/contracts/case-model-schema';
import type {
  CaseBlueprint,
  CaseGenerationRequest,
} from '../../src/shared/api/contracts/case-contract';
import { buildCaseMessages, buildRepairPrompt } from './build-case-prompt';
import { UpstreamError } from './errors';
import { evaluateBlueprint } from './evaluate-blueprint';
import type { ChatMessage, OpenRouterClient } from './openrouter-client';

export interface CaseGeneratorOptions {
  /** Скільки разів просимо модель виправити справу, що не пройшла перевірку */
  readonly maxAttempts: number;
  readonly attemptTimeoutMs: number;
  readonly totalTimeoutMs: number;
  readonly model?: string | undefined;
}

export interface CaseGenerator {
  generate(request: CaseGenerationRequest, signal: AbortSignal): Promise<CaseBlueprint>;
}

export function createCaseGenerator(
  client: OpenRouterClient,
  options: CaseGeneratorOptions,
): CaseGenerator {
  const { maxAttempts, attemptTimeoutMs, totalTimeoutMs, model } = options;

  return {
    async generate(request, clientSignal) {
      const totalSignal = AbortSignal.timeout(totalTimeoutMs);
      const signal = AbortSignal.any([clientSignal, totalSignal]);
      const messages: ChatMessage[] = buildCaseMessages(request);
      let problems: readonly string[] = [];

      try {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          const raw = await client.complete({
            name: 'detective_case',
            schema: caseModelJsonSchema,
            messages: [...messages],
            signal,
            model,
            timeoutMs: attemptTimeoutMs,
            maxTokens: 4000,
            // Задача на виконання обмежень, а не творчість: низька температура дає менше порушень
            temperature: 0.4,
          });

          const outcome = evaluateBlueprint(raw);
          if (outcome.ok) return outcome.blueprint;

          problems = outcome.problems;
          console.warn(`[case] спробу ${String(attempt)} відхилено: ${problems.join('; ')}`);
          // Модель бачить власну відповідь і перелік проблем, тож виправляє, а не починає з нуля
          messages.push(
            { role: 'assistant', content: raw },
            { role: 'user', content: buildRepairPrompt(problems) },
          );
        }
      } catch (error) {
        if (!clientSignal.aborted && totalSignal.aborted) {
          throw new UpstreamError('timeout', 'Загальний дедлайн генерації вичерпано', {
            retryable: false,
            cause: error,
          });
        }
        throw error;
      }

      throw new UpstreamError(
        'invalid_output',
        `Не вдалося згенерувати коректну справу: ${problems.join('; ')}`,
        { retryable: false },
      );
    },
  };
}
