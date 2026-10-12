import { z } from 'zod';
import { analyzeCase, blueprintToCase, type DetectiveCase } from '@/entities/case';
import { caseBlueprintSchema, type CaseGenerationRequest } from '@/shared/api';
import { CaseApiError, type CaseApiErrorCode } from './case-api-error';

const ENDPOINT = '/api/case/generate';
const REQUEST_TIMEOUT_MS = 125_000;

const responseSchema = z.object({ blueprint: caseBlueprintSchema });
const errorSchema = z.object({ error: z.object({ code: z.string() }) });

async function readServerCode(response: Response): Promise<string | undefined> {
  const body: unknown = await response.json().catch(() => undefined);
  const parsed = errorSchema.safeParse(body);
  return parsed.success ? parsed.data.error.code : undefined;
}

function toErrorCode(status: number, serverCode: string | undefined): CaseApiErrorCode {
  if (serverCode === 'invalid_output') return 'invalid_case';
  if (status === 429) return 'rate_limited';
  if (status === 408 || status === 504) return 'timeout';
  return 'unavailable';
}

export async function requestCase(
  request: CaseGenerationRequest,
  signal?: AbortSignal,
): Promise<DetectiveCase> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal === undefined ? timeout : AbortSignal.any([signal, timeout]);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: combined,
    });
  } catch (error) {
    if (signal?.aborted === true) throw error;
    throw new CaseApiError(timeout.aborted ? 'timeout' : 'network', 'Запит не вдався', {
      cause: error,
    });
  }

  if (!response.ok) {
    const serverCode = await readServerCode(response);
    throw new CaseApiError(
      toErrorCode(response.status, serverCode),
      `HTTP ${String(response.status)}`,
    );
  }

  const body: unknown = await response.json().catch(() => undefined);
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) throw new CaseApiError('invalid_response', 'Неочікуваний формат відповіді');

  const converted = blueprintToCase(parsed.data.blueprint, crypto.randomUUID());
  if (!converted.ok) throw new CaseApiError('invalid_case', converted.problems.join('; '));

  const problems = analyzeCase(converted.value);
  if (problems.length > 0) throw new CaseApiError('invalid_case', problems.join('; '));

  return converted.value;
}
