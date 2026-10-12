import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase } from '@/entities/case';
import { buildRephraseRequest } from './build-rephrase-request';
import { prepareDecision } from './prepare-decision';
import { resolveNpcAnswer } from './resolve-npc-answer';

const input = prepareDecision({
  detectiveCase: officeDisappearanceCase,
  npcId: 'char-andriy',
  topicId: 'evt-night-deploy',
  discoveredClueIds: [],
  liePolicy: 'always',
});
const request = buildRephraseRequest(input, resolveNpcAnswer(input));

describe('buildRephraseRequest', () => {
  it('містить лише персону, тему й уже вирішену репліку', () => {
    expect(request).toEqual({
      persona: {
        name: 'Андрій',
        role: 'DevOps-інженер',
        description: 'Керує інфраструктурою та деплоями.',
      },
      topic: 'Нічний деплой',
      statement: 'Я був удома і нічого не деплоїв.',
    });
  });

  it('не містить службових даних, які можуть видати винного', () => {
    const payload = JSON.stringify(request);

    expect(payload).not.toContain('culprit');
    expect(payload).not.toContain('wasLie');
    expect(payload).not.toContain('char-');
    expect(payload).not.toContain('clue-');
  });
});
