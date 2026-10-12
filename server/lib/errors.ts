export type UpstreamFailure =
  'timeout' | 'network' | 'rate_limited' | 'unavailable' | 'auth' | 'rejected' | 'invalid_output';

interface UpstreamErrorOptions {
  readonly retryable: boolean;
  readonly retryAfterMs?: number | undefined;
  readonly cause?: unknown;
}

export class UpstreamError extends Error {
  readonly failure: UpstreamFailure;
  readonly retryable: boolean;
  readonly retryAfterMs: number | undefined;

  constructor(failure: UpstreamFailure, message: string, options: UpstreamErrorOptions) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'UpstreamError';
    this.failure = failure;
    this.retryable = options.retryable;
    this.retryAfterMs = options.retryAfterMs;
  }
}
