import type { DetectiveCase, NpcAnswer } from '@/entities/case';
import type { GameRules } from './rules';

export type GameStatus = 'investigating' | 'won' | 'lost';

export interface LogEntry {
  readonly id: string;
  readonly npcId: string;
  readonly topicId: string;
  readonly knownClueCount: number;
  readonly answer: NpcAnswer | null;
}

export interface GameState {
  readonly detectiveCase: DetectiveCase;
  readonly rules: GameRules;
  readonly status: GameStatus;
  readonly questionsLeft: number;
  readonly discoveredClueIds: readonly string[];
  readonly log: readonly LogEntry[];
  readonly accusedId: string | null;
  readonly error: string | null;
}

export type GameAction =
  | { type: 'question_asked'; entryId: string; npcId: string; topicId: string }
  | { type: 'answer_received'; entryId: string; answer: NpcAnswer }
  | { type: 'question_failed'; entryId: string; message: string }
  | { type: 'accused'; suspectId: string }
  | { type: 'restarted' };

export type AskBlockReason =
  'game_over' | 'pending' | 'no_questions' | 'repeat_forbidden' | 'repeat_needs_evidence';

export type AskCheck =
  { readonly ok: true } | { readonly ok: false; readonly reason: AskBlockReason };
