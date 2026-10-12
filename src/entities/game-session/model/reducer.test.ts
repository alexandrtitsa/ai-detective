import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase } from '@/entities/case';
import { createInitialState, gameReducer } from './reducer';
import { DEFAULT_RULES, RULES_BY_DIFFICULTY, type GameRules } from './rules';
import type { GameAction, GameState } from './types';

const reduce = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

const ask = (entryId = 'q1', npcId = 'char-iryna', topicId = 'char-andriy'): GameAction => ({
  type: 'question_asked',
  entryId,
  npcId,
  topicId,
});

const answer = (entryId = 'q1', revealedClueId?: string): GameAction => ({
  type: 'answer_received',
  entryId,
  answer: {
    statement: 'Відповідь',
    wasLie: false,
    ...(revealedClueId !== undefined && { revealedClueId }),
  },
});

const initial = createInitialState(officeDisappearanceCase);

describe('gameReducer', () => {
  it('створює початковий стан', () => {
    expect(initial).toMatchObject({
      rules: DEFAULT_RULES,
      status: 'investigating',
      questionsLeft: 8,
      discoveredClueIds: [],
      log: [],
      accusedId: null,
      error: null,
    });
  });

  describe('question_asked', () => {
    it('віднімає питання та додає запис, що очікує відповіді', () => {
      const state = reduce(initial, ask());
      expect(state.questionsLeft).toBe(7);
      expect(state.log).toEqual([
        { id: 'q1', npcId: 'char-iryna', topicId: 'char-andriy', knownClueCount: 0, answer: null },
      ]);
    });

    it('ігнорує нове питання, поки є очікуване', () => {
      const pending = reduce(initial, ask('q1'));
      expect(reduce(pending, ask('q2'))).toBe(pending);
    });

    it('ігнорує невідомого NPC або тему', () => {
      expect(reduce(initial, ask('q1', 'nobody'))).toBe(initial);
      expect(reduce(initial, ask('q1', 'char-iryna', 'nothing'))).toBe(initial);
    });

    it('ігнорує питання, коли ліміт вичерпано', () => {
      const exhausted: GameState = { ...initial, questionsLeft: 0 };
      expect(reduce(exhausted, ask())).toBe(exhausted);
    });
  });

  describe('повторні питання', () => {
    const firstAsk = [ask('q1', 'char-andriy', 'evt-night-deploy'), answer('q1')];
    const sameAgain = ask('q2', 'char-andriy', 'evt-night-deploy');
    const newEvidence = [ask('q3', 'char-marina', 'evt-night-deploy'), answer('q3', 'clue-deploy')];

    const withPolicy = (repeatPolicy: GameRules['repeatPolicy']) =>
      createInitialState(officeDisappearanceCase, { liePolicy: 'cracks', repeatPolicy });

    it('allow: повтор дозволено завжди', () => {
      const state = reduce(withPolicy('allow'), ...firstAsk);
      expect(reduce(state, sameAgain).log).toHaveLength(2);
    });

    it('block: повтор заборонено навіть із новими доказами', () => {
      const state = reduce(withPolicy('block'), ...firstAsk, ...newEvidence);
      expect(reduce(state, sameAgain)).toBe(state);
    });

    it('new-evidence: повтор заборонено без нових доказів', () => {
      const state = reduce(withPolicy('new-evidence'), ...firstAsk);
      expect(reduce(state, sameAgain)).toBe(state);
    });

    it('new-evidence: повтор дозволено після нового доказу', () => {
      const state = reduce(withPolicy('new-evidence'), ...firstAsk, ...newEvidence);
      expect(reduce(state, sameAgain).log).toHaveLength(3);
    });

    it('невдале питання не вважається повтором навіть при block', () => {
      const failed: GameAction = { type: 'question_failed', entryId: 'q1', message: 'Помилка' };
      const state = reduce(
        withPolicy('block'),
        ask('q1', 'char-andriy', 'evt-night-deploy'),
        failed,
      );
      expect(reduce(state, sameAgain).log).toHaveLength(1);
    });
  });

  describe('answer_received', () => {
    it('записує відповідь і відкриває доказ', () => {
      const state = reduce(initial, ask(), answer('q1', 'clue-laptop'));
      expect(state.log[0]?.answer?.statement).toBe('Відповідь');
      expect(state.discoveredClueIds).toEqual(['clue-laptop']);
    });

    it('не дублює вже відкритий доказ', () => {
      const state = reduce(
        initial,
        ask('q1'),
        answer('q1', 'clue-laptop'),
        ask('q2'),
        answer('q2', 'clue-laptop'),
      );
      expect(state.discoveredClueIds).toEqual(['clue-laptop']);
    });

    it('ігнорує відповідь на невідоме питання', () => {
      expect(reduce(initial, answer('ghost'))).toBe(initial);
    });
  });

  describe('question_failed', () => {
    const failed: GameAction = { type: 'question_failed', entryId: 'q1', message: 'Помилка' };

    it('повертає питання гравцю, прибирає запис і зберігає помилку', () => {
      const state = reduce(initial, ask(), failed);
      expect(state.questionsLeft).toBe(8);
      expect(state.log).toEqual([]);
      expect(state.error).toBe('Помилка');
    });

    it('скидає помилку наступним питанням', () => {
      const state = reduce(initial, ask('q1'), failed, ask('q2'));
      expect(state.error).toBeNull();
    });
  });

  describe('accused', () => {
    it('перемога при правильному звинуваченні', () => {
      const state = reduce(initial, { type: 'accused', suspectId: 'char-andriy' });
      expect(state).toMatchObject({ status: 'won', accusedId: 'char-andriy' });
    });

    it('поразка при хибному звинуваченні', () => {
      const state = reduce(initial, { type: 'accused', suspectId: 'char-marina' });
      expect(state.status).toBe('lost');
    });

    it('ігнорує звинувачення не-персонажа', () => {
      expect(reduce(initial, { type: 'accused', suspectId: 'loc-kitchen' })).toBe(initial);
    });

    it('ігнорує звинувачення, поки очікується відповідь', () => {
      const pending = reduce(initial, ask());
      expect(reduce(pending, { type: 'accused', suspectId: 'char-andriy' })).toBe(pending);
    });

    it('не дозволяє змінити результат після завершення гри', () => {
      const finished = reduce(initial, { type: 'accused', suspectId: 'char-marina' });
      expect(reduce(finished, { type: 'accused', suspectId: 'char-andriy' })).toBe(finished);
    });
  });

  describe('restarted', () => {
    it('повертає початковий стан тієї самої справи', () => {
      const state = reduce(initial, ask(), answer('q1', 'clue-laptop'), { type: 'restarted' });
      expect(state).toEqual(initial);
    });

    it('зберігає правила гри', () => {
      const hard = createInitialState(officeDisappearanceCase, RULES_BY_DIFFICULTY.hard);
      const state = reduce(hard, ask(), { type: 'restarted' });
      expect(state.rules).toEqual(RULES_BY_DIFFICULTY.hard);
    });
  });

  it('повний сценарій: перехресна перевірка викриває брехуна', () => {
    const state = reduce(
      initial,
      ask('q1', 'char-andriy', 'evt-night-deploy'),
      answer('q1'),
      ask('q2', 'char-marina', 'evt-night-deploy'),
      answer('q2', 'clue-deploy'),
      { type: 'accused', suspectId: 'char-andriy' },
    );
    expect(state.discoveredClueIds).toEqual(['clue-deploy']);
    expect(state.status).toBe('won');
  });
});
