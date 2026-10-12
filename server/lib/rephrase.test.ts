import { describe, expect, it, vi } from 'vitest';
import type { NpcRephraseRequest } from '../../src/shared/api/contracts/npc-contract';
import { UpstreamError } from './errors';
import type { OpenRouterClient } from './openrouter-client';
import { createRephraseService } from './rephrase';

const request: NpcRephraseRequest = {
  persona: { name: 'Марина', role: 'Проєктна менеджерка', description: 'Відповідає за терміни.' },
  topic: 'Бейдж Олега',
  statement: 'Бейдж Олега востаннє відмітився в серверній о 02:14.',
};

const good = JSON.stringify({ statement: 'Ага, його бейдж пікнув у серверній о 02:14.' });
const wrongTime = JSON.stringify({ statement: 'Здається, це було о 03:00.' });

function run(complete: OpenRouterClient['complete']) {
  const service = createRephraseService(
    { complete },
    { maxAttempts: 3, totalTimeoutMs: 1000, baseDelayMs: 0 },
  );
  return service.rephrase(request, new AbortController().signal);
}

describe('createRephraseService', () => {
  it('повертає перефразовану репліку', async () => {
    const complete = vi.fn<OpenRouterClient['complete']>().mockResolvedValue(good);

    await expect(run(complete)).resolves.toContain('02:14');
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('повторює запит, якщо модель змінила факти', async () => {
    const complete = vi
      .fn<OpenRouterClient['complete']>()
      .mockResolvedValueOnce(wrongTime)
      .mockResolvedValueOnce(good);

    await expect(run(complete)).resolves.toContain('02:14');
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it('повторює запит після тимчасової помилки апстріму', async () => {
    const complete = vi
      .fn<OpenRouterClient['complete']>()
      .mockRejectedValueOnce(new UpstreamError('unavailable', '503', { retryable: true }))
      .mockResolvedValueOnce(good);

    await expect(run(complete)).resolves.toContain('02:14');
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it('не повторює фатальну помилку (ключ або баланс)', async () => {
    const complete = vi
      .fn<OpenRouterClient['complete']>()
      .mockRejectedValue(new UpstreamError('auth', '401', { retryable: false }));

    await expect(run(complete)).rejects.toMatchObject({ failure: 'auth' });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('здається, коли всі спроби повернули сміття', async () => {
    const complete = vi.fn<OpenRouterClient['complete']>().mockResolvedValue('не JSON');

    await expect(run(complete)).rejects.toMatchObject({ failure: 'invalid_output' });
    expect(complete).toHaveBeenCalledTimes(3);
  });
});
