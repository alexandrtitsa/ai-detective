import { NpcApiError, type NpcApiErrorCode } from '../api/npc-api-error';

const REASONS: Record<NpcApiErrorCode, string> = {
  timeout: 'NPC задумався надто довго.',
  rate_limited: 'Забагато запитів поспіль, зачекай хвилину.',
  unavailable: 'AI-сервіс тимчасово недоступний.',
  network: 'Немає звʼязку із сервером гри.',
  invalid_response: 'Сервер повернув некоректну відповідь.',
};

export function describeNpcError(error: unknown): string {
  const reason = error instanceof NpcApiError ? REASONS[error.code] : 'Щось пішло не так.';
  return `${reason} Питання повернуто, спробуй ще раз.`;
}
