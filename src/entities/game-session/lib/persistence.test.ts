import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase as detectiveCase } from '@/entities/case';
import { createInitialState, gameReducer } from '../model/reducer';
import type { GameAction, GameState } from '../model/types';
import { restoreGame, serializeGame } from './persistence';

const reduce = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

const ask = (entryId: string, npcId: string, topicId: string): GameAction => ({
  type: 'question_asked',
  entryId,
  npcId,
  topicId,
});

const answer = (entryId: string, revealedClueId?: string): GameAction => ({
  type: 'answer_received',
  entryId,
  answer: {
    statement: 'Відповідь',
    wasLie: revealedClueId === undefined,
    ...(revealedClueId !== undefined && { revealedClueId }),
  },
});

const played = reduce(
  createInitialState(detectiveCase),
  ask('q1', 'char-andriy', 'evt-night-deploy'),
  answer('q1'),
  ask('q2', 'char-marina', 'evt-night-deploy'),
  answer('q2', 'clue-deploy'),
);

const roundTrip = (state: GameState) =>
  restoreGame(structuredClone(serializeGame(state)), detectiveCase);

describe('збереження партії', () => {
  it('відновлює партію після серіалізації', () => {
    expect(roundTrip(played)).toEqual(played);
  });

  it('відновлює завершену партію', () => {
    const won = reduce(played, { type: 'accused', suspectId: 'char-andriy' });

    expect(roundTrip(won)).toEqual(won);
  });

  it('відновлює партію з питанням, що чекає відповіді', () => {
    const pending = reduce(played, ask('q3', 'char-iryna', 'char-andriy'));

    expect(roundTrip(pending)).toEqual(pending);
  });

  it('не відновлює партію іншої справи', () => {
    expect(restoreGame(serializeGame(played), { ...detectiveCase, id: 'other' })).toBeUndefined();
  });

  it.each([
    ['рядок', 'x'],
    ['null', null],
    ['порожній обʼєкт', {}],
  ])('відхиляє сміття: %s', (_name, raw) => {
    expect(restoreGame(raw, detectiveCase)).toBeUndefined();
  });

  const tampered: [string, (saved: ReturnType<typeof serializeGame>) => unknown][] = [
    ['questionsLeft не відповідає журналу', (saved) => ({ ...saved, questionsLeft: 99 })],
    [
      'невідомий NPC',
      (saved) => ({ ...saved, log: saved.log.map((entry) => ({ ...entry, npcId: 'nobody' })) }),
    ],
    [
      'докази не збігаються з відповідями',
      (saved) => ({ ...saved, discoveredClueIds: ['clue-badge'] }),
    ],
    [
      'перемога без правильного звинувачення',
      (saved) => ({ ...saved, status: 'won', accusedId: 'char-marina' }),
    ],
    ['інша версія формату', (saved) => ({ ...saved, version: 2 })],
  ];

  it.each(tampered)('відхиляє підроблене збереження: %s', (_name, tamper) => {
    expect(restoreGame(tamper(serializeGame(played)), detectiveCase)).toBeUndefined();
  });
});
