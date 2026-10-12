import { describe, expect, it, vi } from 'vitest';
import { retry } from './retry';

const options = { attempts: 3, baseDelayMs: 0, maxDelayMs: 0, shouldRetry: () => true };

describe('retry', () => {
  it('повертає результат першої вдалої спроби', async () => {
    const task = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue('ok');

    await expect(retry(task, options)).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('кидає останню помилку, коли спроби вичерпано', async () => {
    const task = vi.fn<() => Promise<never>>().mockRejectedValue(new Error('boom'));

    await expect(retry(task, options)).rejects.toThrow('boom');
    expect(task).toHaveBeenCalledTimes(3);
  });

  it('не повторює, коли shouldRetry повертає false', async () => {
    const task = vi.fn<() => Promise<never>>().mockRejectedValue(new Error('fatal'));

    await expect(retry(task, { ...options, shouldRetry: () => false })).rejects.toThrow('fatal');
    expect(task).toHaveBeenCalledTimes(1);
  });
});
