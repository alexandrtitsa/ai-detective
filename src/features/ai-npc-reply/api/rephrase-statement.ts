import { npcRephraseResponseSchema, type NpcRephraseRequest } from '@/shared/api';
import { NpcApiError, type NpcApiErrorCode } from './npc-api-error';

const ENDPOINT = '/api/npc/rephrase';
const REQUEST_TIMEOUT_MS = 16_000;

function codeFromStatus(status: number): NpcApiErrorCode {
  if (status === 429) return 'rate_limited';
  if (status === 408 || status === 504) return 'timeout';
  return 'unavailable';
}

export async function rephraseStatement(
  request: NpcRephraseRequest,
  signal?: AbortSignal,
): Promise<string> {
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
    throw new NpcApiError(timeout.aborted ? 'timeout' : 'network', 'Запит не вдався', {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new NpcApiError(codeFromStatus(response.status), `HTTP ${String(response.status)}`);
  }

  const body: unknown = await response.json().catch(() => undefined);
  const parsed = npcRephraseResponseSchema.safeParse(body);
  if (!parsed.success) throw new NpcApiError('invalid_response', 'Неочікуваний формат відповіді');

  return parsed.data.statement;
}
