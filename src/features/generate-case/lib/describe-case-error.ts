import { CaseApiError, type CaseApiErrorCode } from '../api/case-api-error';

const REASONS: Record<CaseApiErrorCode, string> = {
  timeout: 'Генерація тривала надто довго.',
  rate_limited: 'Забагато спроб поспіль, зачекай хвилину.',
  unavailable: 'AI-сервіс тимчасово недоступний.',
  network: 'Немає звʼязку із сервером гри.',
  invalid_response: 'Сервер повернув некоректну відповідь.',
  invalid_case: 'AI не зміг скласти коректну справу.',
};

export function describeCaseError(error: unknown): string {
  const reason = error instanceof CaseApiError ? REASONS[error.code] : 'Щось пішло не так.';
  return `${reason} Спробуй ще раз або змінити тему.`;
}
