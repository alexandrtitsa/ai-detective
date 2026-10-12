import type { Clue } from '@/entities/case';
import type { AskBlockReason, AskCheck, GameState, LogEntry } from './types';

export function selectPendingEntry(state: GameState): LogEntry | undefined {
  return state.log.find((entry) => entry.answer === null);
}

export function selectWasAsked(state: GameState, npcId: string, topicId: string): boolean {
  return state.log.some((entry) => entry.npcId === npcId && entry.topicId === topicId);
}

function repeatBlockReason(
  state: GameState,
  npcId: string,
  topicId: string,
): AskBlockReason | null {
  const { repeatPolicy } = state.rules;
  if (repeatPolicy === 'allow') return null;

  const previous = state.log.findLast(
    (entry) => entry.npcId === npcId && entry.topicId === topicId,
  );
  if (previous === undefined) return null;
  if (repeatPolicy === 'block') return 'repeat_forbidden';

  const hasNewEvidence = state.discoveredClueIds.length > previous.knownClueCount;
  return hasNewEvidence ? null : 'repeat_needs_evidence';
}

const blocked = (reason: AskBlockReason): AskCheck => ({ ok: false, reason });

export function selectAskCheck(state: GameState, npcId: string, topicId: string): AskCheck {
  if (state.status !== 'investigating') return blocked('game_over');
  if (selectPendingEntry(state) !== undefined) return blocked('pending');
  if (state.questionsLeft <= 0) return blocked('no_questions');

  const repeat = repeatBlockReason(state, npcId, topicId);
  return repeat === null ? { ok: true } : blocked(repeat);
}

export function selectDiscoveredClues(state: GameState): Clue[] {
  return state.discoveredClueIds.flatMap((id) => {
    const clue = state.detectiveCase.clues.find((item) => item.id === id);
    return clue === undefined ? [] : [clue];
  });
}
