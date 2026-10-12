export type CaseApiErrorCode =
  'timeout' | 'rate_limited' | 'unavailable' | 'network' | 'invalid_response' | 'invalid_case';

export class CaseApiError extends Error {
  readonly code: CaseApiErrorCode;

  constructor(code: CaseApiErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CaseApiError';
    this.code = code;
  }
}
