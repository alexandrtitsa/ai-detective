import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase as detectiveCase, type LiePolicyId } from '@/entities/case';
import { prepareDecision } from './prepare-decision';
import { resolveNpcAnswer } from './resolve-npc-answer';

interface AskOptions {
  readonly liePolicy?: LiePolicyId;
  readonly discovered?: readonly string[];
}

function ask(npcId: string, topicId: string, options: AskOptions = {}) {
  const { liePolicy = 'always', discovered = [] } = options;
  return resolveNpcAnswer(
    prepareDecision({ detectiveCase, npcId, topicId, discoveredClueIds: discovered, liePolicy }),
  );
}

describe('resolveNpcAnswer', () => {
  it('чесний NPC розкриває доказ', () => {
    expect(ask('char-iryna', 'char-andriy')).toMatchObject({
      revealedClueId: 'clue-laptop',
      wasLie: false,
    });
  });

  it('NPC бреше про факт, якого не може підтвердити сам', () => {
    const answer = ask('char-andriy', 'evt-night-deploy');
    expect(answer.wasLie).toBe(true);
    expect(answer.revealedClueId).toBeUndefined();
  });

  it('той самий факт можна перевірити в іншого NPC', () => {
    expect(ask('char-marina', 'evt-night-deploy')).toMatchObject({
      revealedClueId: 'clue-deploy',
      wasLie: false,
    });
  });

  it('повертає "не знаю" для невідомої теми', () => {
    const answer = ask('char-marina', 'loc-kitchen');
    expect(answer.revealedClueId).toBeUndefined();
    expect(answer.wasLie).toBe(false);
  });

  it('кидає помилку для неіснуючого NPC', () => {
    expect(() => ask('nobody', 'loc-kitchen')).toThrow();
  });

  describe('політики брехні', () => {
    it('always: бреше навіть тоді, коли докази вже є', () => {
      const answer = ask('char-andriy', 'evt-night-deploy', {
        liePolicy: 'always',
        discovered: ['clue-deploy'],
      });
      expect(answer.wasLie).toBe(true);
    });

    it('cracks: бреше, доки в гравця немає доказу', () => {
      expect(ask('char-andriy', 'evt-night-deploy', { liePolicy: 'cracks' }).wasLie).toBe(true);
    });

    it('cracks: зізнається, коли доказ уже знайдено', () => {
      const answer = ask('char-andriy', 'evt-night-deploy', {
        liePolicy: 'cracks',
        discovered: ['clue-deploy'],
      });
      expect(answer).toMatchObject({ wasLie: false, revealedClueId: 'clue-deploy' });
    });

    it('never: усі кажуть правду', () => {
      const answer = ask('char-andriy', 'evt-night-deploy', { liePolicy: 'never' });
      expect(answer).toMatchObject({ wasLie: false, revealedClueId: 'clue-deploy' });
    });
  });
});
