import { describe, expect, it, vi } from 'vitest';
import { officeDisappearanceBlueprint as blueprint } from '../../src/entities/case/lib/blueprint.fixture';
import { createCaseGenerator } from './case-generator';
import type { OpenRouterClient } from './openrouter-client';

const valid = JSON.stringify(blueprint);
const withoutCulpritLie = JSON.stringify({
  ...blueprint,
  knowledge: blueprint.knowledge.map((item) => ({ ...item, lie: '' })),
});

function run(complete: OpenRouterClient['complete']) {
  const generator = createCaseGenerator(
    { complete },
    { maxAttempts: 3, attemptTimeoutMs: 500, totalTimeoutMs: 1000 },
  );
  return generator.generate({ castSize: 3 }, new AbortController().signal);
}

describe('createCaseGenerator', () => {
  it('повертає blueprint, коли справа пройшла перевірки з першої спроби', async () => {
    const complete = vi.fn<OpenRouterClient['complete']>().mockResolvedValue(valid);

    await expect(run(complete)).resolves.toEqual(blueprint);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('просить модель виправити справу й передає їй список проблем', async () => {
    const complete = vi
      .fn<OpenRouterClient['complete']>()
      .mockResolvedValueOnce(withoutCulpritLie)
      .mockResolvedValueOnce(valid);

    await expect(run(complete)).resolves.toEqual(blueprint);
    expect(complete).toHaveBeenCalledTimes(2);

    const second = complete.mock.calls[1]?.[0];
    expect(second?.messages).toHaveLength(4); // system, user, відповідь моделі, запит на виправлення
    expect(second?.messages.at(-1)?.content).toContain('не бреше');
  });

  it('здається, коли всі спроби не пройшли перевірку', async () => {
    const complete = vi.fn<OpenRouterClient['complete']>().mockResolvedValue(withoutCulpritLie);

    await expect(run(complete)).rejects.toMatchObject({ failure: 'invalid_output' });
    expect(complete).toHaveBeenCalledTimes(3);
  });
});
