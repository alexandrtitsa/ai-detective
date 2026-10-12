import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase } from '@/entities/case';
import { createInitialState, gameReducer } from './reducer';
import { RULES_BY_DIFFICULTY } from './rules';
import {
  selectAskCheck,
  selectDiscoveredClues,
  selectPendingEntry,
  selectWasAsked,
} from './selectors';
import type { GameAction, GameState } from './types';

const reduce = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

const ask = (entryId: string, npcId = 'char-andriy', topicId = 'evt-night-deploy'): GameAction => ({
  type: 'question_asked',
  entryId,
  npcId,
  topicId,
});

const answered = (entryId: string, revealedClueId?: string): GameAction => ({
  type: 'answer_received',
  entryId,
  answer: {
    statement: 'Відповідь',
    wasLie: false,
    ...(revealedClueId !== undefined && { revealedClueId }),
  },
});

const initial = createInitialState(officeDisappearanceCase);

describe('selectAskCheck', () => {
  it('дозволяє перше питання', () => {
    expect(selectAskCheck(initial, 'char-andriy', 'evt-night-deploy')).toEqual({ ok: true });
  });

  it('блокує, поки очікується відповідь', () => {
    const state = reduce(initial, ask('q1'));
    expect(selectAskCheck(state, 'char-marina', 'loc-kitchen')).toEqual({
      ok: false,
      reason: 'pending',
    });
  });

  it('блокує, коли питання закінчились', () => {
    const state: GameState = { ...initial, questionsLeft: 0 };
    expect(selectAskCheck(state, 'char-marina', 'loc-kitchen')).toEqual({
      ok: false,
      reason: 'no_questions',
    });
  });

  it('завершена гра важливіша за інші причини', () => {
    const state = reduce(initial, { type: 'accused', suspectId: 'char-marina' });
    expect(selectAskCheck(state, 'char-andriy', 'evt-night-deploy')).toEqual({
      ok: false,
      reason: 'game_over',
    });
  });

  describe('повтори питань', () => {
    it('normal: без нових доказів потрібні докази', () => {
      const state = reduce(initial, ask('q1'), answered('q1'));
      expect(selectAskCheck(state, 'char-andriy', 'evt-night-deploy')).toEqual({
        ok: false,
        reason: 'repeat_needs_evidence',
      });
    });

    it('normal: після нового доказу повтор дозволено', () => {
      const state = reduce(
        initial,
        ask('q1'),
        answered('q1'),
        ask('q2', 'char-marina'),
        answered('q2', 'clue-deploy'),
      );
      expect(selectAskCheck(state, 'char-andriy', 'evt-night-deploy')).toEqual({ ok: true });
    });

    it('easy: повтор дозволено завжди', () => {
      const easy = createInitialState(officeDisappearanceCase, RULES_BY_DIFFICULTY.easy);
      const state = reduce(easy, ask('q1'), answered('q1'));
      expect(selectAskCheck(state, 'char-andriy', 'evt-night-deploy')).toEqual({ ok: true });
    });

    it('hard: повтор заборонено повністю', () => {
      const hard = createInitialState(officeDisappearanceCase, RULES_BY_DIFFICULTY.hard);
      const state = reduce(hard, ask('q1'), answered('q1'));
      expect(selectAskCheck(state, 'char-andriy', 'evt-night-deploy')).toEqual({
        ok: false,
        reason: 'repeat_forbidden',
      });
    });

    it('інша пара NPC + тема не вважається повтором', () => {
      const hard = createInitialState(officeDisappearanceCase, RULES_BY_DIFFICULTY.hard);
      const state = reduce(hard, ask('q1'), answered('q1'));
      expect(selectAskCheck(state, 'char-marina', 'evt-night-deploy')).toEqual({ ok: true });
    });
  });
});

describe('selectWasAsked', () => {
  it('реагує лише на ту саму пару NPC + тема', () => {
    const state = reduce(initial, ask('q1'), answered('q1'));
    expect(selectWasAsked(state, 'char-andriy', 'evt-night-deploy')).toBe(true);
    expect(selectWasAsked(state, 'char-marina', 'evt-night-deploy')).toBe(false);
  });
});

describe('selectPendingEntry', () => {
  it('повертає запис без відповіді й undefined, коли всі питання закриті', () => {
    expect(selectPendingEntry(initial)).toBeUndefined();

    const pending = reduce(initial, ask('q1'));
    expect(selectPendingEntry(pending)?.id).toBe('q1');

    const done = reduce(pending, answered('q1'));
    expect(selectPendingEntry(done)).toBeUndefined();
  });
});

describe('selectDiscoveredClues', () => {
  it('порожній список, поки доказів немає', () => {
    expect(selectDiscoveredClues(initial)).toEqual([]);
  });

  it('повертає докази в порядку відкриття', () => {
    const state = reduce(
      initial,
      ask('q1', 'char-iryna', 'char-andriy'),
      answered('q1', 'clue-laptop'),
      ask('q2', 'char-marina', 'evt-night-deploy'),
      answered('q2', 'clue-deploy'),
    );
    expect(selectDiscoveredClues(state).map((clue) => clue.id)).toEqual([
      'clue-laptop',
      'clue-deploy',
    ]);
  });
});
