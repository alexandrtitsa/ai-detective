import { delay } from './delay';

export interface RetryOptions {
  readonly attempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly signal?: AbortSignal;
  readonly shouldRetry: (error: unknown) => boolean;
  readonly getDelayMs?: (error: unknown) => number | undefined;
}

export async function retry<T>(task: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, baseDelayMs, maxDelayMs, signal, shouldRetry, getDelayMs } = options;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      const isLastAttempt = attempt >= attempts;
      if (isLastAttempt || signal?.aborted === true || !shouldRetry(error)) throw error;

      const hinted = getDelayMs?.(error);
      const backoff = Math.random() * Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      await delay(hinted === undefined ? backoff : Math.min(hinted, maxDelayMs), signal);
    }
  }
}
