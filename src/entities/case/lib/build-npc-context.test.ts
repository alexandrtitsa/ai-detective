import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase as detectiveCase } from '../model/office-disappearance';
import { buildNpcContext } from './build-npc-context';

describe('buildNpcContext', () => {
  it('містить лише факти, які NPC знає', () => {
    const iryna = buildNpcContext(detectiveCase, 'char-iryna');
    expect(iryna.knowledge.map((fact) => fact.clueId)).toEqual(['clue-alibi', 'clue-laptop']);
  });

  it('додає підготовлену брехню лише там, де вона є в даних', () => {
    const andriy = buildNpcContext(detectiveCase, 'char-andriy');
    expect(andriy.knowledge).toEqual([
      {
        clueId: 'clue-deploy',
        relatedEntityIds: ['evt-night-deploy', 'char-andriy'],
        truth: 'О 02:10 хтось запустив деплой з акаунта Андрія.',
        lie: 'Я був удома і нічого не деплоїв.',
      },
    ]);
  });

  it('не містить службових даних справи й чужих персон', () => {
    const payload = JSON.stringify(buildNpcContext(detectiveCase, 'char-marina'));

    expect(payload).not.toContain('culprit');
    expect(payload).not.toContain('maxQuestions');
    expect(payload).not.toContain('clue-laptop'); // доказ, якого Марина не знає
    expect(payload).not.toContain('DevOps-інженер'); // роль іншого персонажа
  });

  it('кидає помилку для неіснуючого NPC', () => {
    expect(() => buildNpcContext(detectiveCase, 'nobody')).toThrow();
  });
});
