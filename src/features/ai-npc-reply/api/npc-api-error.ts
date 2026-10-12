export type NpcApiErrorCode =
  'timeout' | 'rate_limited' | 'unavailable' | 'network' | 'invalid_response';

export class NpcApiError extends Error {
  readonly code: NpcApiErrorCode;

  constructor(code: NpcApiErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NpcApiError';
    this.code = code;
  }
}
