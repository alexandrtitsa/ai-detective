import { findCharacter, findEntity, type DetectiveCase } from '@/entities/case';
import { assertNever } from '@/shared/lib';
import { DEFAULT_RULES, type GameRules } from './rules';
import { selectAskCheck, selectPendingEntry } from './selectors';
import type { GameAction, GameState } from './types';

export function createInitialState(
  detectiveCase: DetectiveCase,
  rules: GameRules = DEFAULT_RULES,
): GameState {
  return {
    detectiveCase,
    rules,
    status: 'investigating',
    questionsLeft: detectiveCase.maxQuestions,
    discoveredClueIds: [],
    log: [],
    accusedId: null,
    error: null,
  };
}

type ActionOf<T extends GameAction['type']> = Extract<GameAction, { type: T }>;

function askQuestion(state: GameState, action: ActionOf<'question_asked'>): GameState {
  const { detectiveCase } = state;
  const isAllowed =
    findCharacter(detectiveCase, action.npcId) !== undefined &&
    findEntity(detectiveCase, action.topicId) !== undefined &&
    selectAskCheck(state, action.npcId, action.topicId).ok;

  if (!isAllowed) return state;

  return {
    ...state,
    questionsLeft: state.questionsLeft - 1,
    error: null,
    log: [
      ...state.log,
      {
        id: action.entryId,
        npcId: action.npcId,
        topicId: action.topicId,
        knownClueCount: state.discoveredClueIds.length,
        answer: null,
      },
    ],
  };
}

function receiveAnswer(state: GameState, action: ActionOf<'answer_received'>): GameState {
  const entry = state.log.find((item) => item.id === action.entryId);
  if (entry === undefined || entry.answer !== null) return state;

  const { revealedClueId } = action.answer;
  const isNewClue =
    revealedClueId !== undefined && !state.discoveredClueIds.includes(revealedClueId);

  return {
    ...state,
    log: state.log.map((item) =>
      item.id === action.entryId ? { ...item, answer: action.answer } : item,
    ),
    discoveredClueIds: isNewClue
      ? [...state.discoveredClueIds, revealedClueId]
      : state.discoveredClueIds,
  };
}

function failQuestion(state: GameState, action: ActionOf<'question_failed'>): GameState {
  const entry = state.log.find((item) => item.id === action.entryId);
  if (entry === undefined || entry.answer !== null) return state;

  return {
    ...state,
    questionsLeft: state.questionsLeft + 1,
    log: state.log.filter((item) => item.id !== action.entryId),
    error: action.message,
  };
}

function accuse(state: GameState, action: ActionOf<'accused'>): GameState {
  const isAllowed =
    state.status === 'investigating' &&
    selectPendingEntry(state) === undefined &&
    findCharacter(state.detectiveCase, action.suspectId) !== undefined;

  if (!isAllowed) return state;

  return {
    ...state,
    accusedId: action.suspectId,
    status: action.suspectId === state.detectiveCase.culpritId ? 'won' : 'lost',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'question_asked':
      return askQuestion(state, action);
    case 'answer_received':
      return receiveAnswer(state, action);
    case 'question_failed':
      return failQuestion(state, action);
    case 'accused':
      return accuse(state, action);
    case 'restarted':
      return createInitialState(state.detectiveCase, state.rules);
    default:
      return assertNever(action);
  }
}
