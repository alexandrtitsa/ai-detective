import { z } from 'zod';
import {
  findCharacter,
  findEntity,
  LIE_POLICY_IDS,
  type DetectiveCase,
  type NpcAnswer,
} from '@/entities/case';
import { REPEAT_POLICY_IDS } from '../model/rules';
import type { GameState, LogEntry } from '../model/types';

const GAME_VERSION = 1;

const answerSchema = z.object({
  statement: z.string().min(1).max(600),
  wasLie: z.boolean(),
  revealedClueId: z.string().min(1).optional(),
});

const entrySchema = z.object({
  id: z.string().min(1),
  npcId: z.string().min(1),
  topicId: z.string().min(1),
  knownClueCount: z.number().int().min(0),
  answer: answerSchema.nullable(),
});

const savedGameSchema = z.object({
  version: z.literal(GAME_VERSION),
  caseId: z.string().min(1),
  rules: z.object({
    liePolicy: z.enum(LIE_POLICY_IDS),
    repeatPolicy: z.enum(REPEAT_POLICY_IDS),
  }),
  status: z.enum(['investigating', 'won', 'lost']),
  questionsLeft: z.number().int().min(0),
  discoveredClueIds: z.array(z.string()),
  log: z.array(entrySchema).max(100),
  accusedId: z.string().nullable(),
});

type SavedGame = z.infer<typeof savedGameSchema>;
type SavedEntry = SavedGame['log'][number];

/** Справу не зберігаємо тут (вона в сесії), а помилку не відновлюємо: це стан одного показу. */
export function serializeGame(state: GameState) {
  return {
    version: GAME_VERSION,
    caseId: state.detectiveCase.id,
    rules: state.rules,
    status: state.status,
    questionsLeft: state.questionsLeft,
    discoveredClueIds: state.discoveredClueIds,
    log: state.log,
    accusedId: state.accusedId,
  };
}

const revealedClueIdOf = (entry: SavedEntry): string | undefined => entry.answer?.revealedClueId;

function isAccusationConsistent(saved: SavedGame, detectiveCase: DetectiveCase): boolean {
  if (saved.status === 'investigating') return saved.accusedId === null;
  if (saved.accusedId === null || findCharacter(detectiveCase, saved.accusedId) === undefined) {
    return false;
  }
  return (saved.status === 'won') === (saved.accusedId === detectiveCase.culpritId);
}

/** Інваріанти, які гарантує reducer. Якщо вони порушені, збереження підроблене або застаріло. */
function isConsistent(saved: SavedGame, detectiveCase: DetectiveCase): boolean {
  const clueIds = new Set(detectiveCase.clues.map((clue) => clue.id));
  const revealed = [
    ...new Set(
      saved.log.flatMap((entry) => {
        const clueId = revealedClueIdOf(entry);
        return clueId === undefined ? [] : [clueId];
      }),
    ),
  ];
  const pending = saved.log.filter((entry) => entry.answer === null);

  const entriesKnown = saved.log.every(
    (entry) =>
      findCharacter(detectiveCase, entry.npcId) !== undefined &&
      findEntity(detectiveCase, entry.topicId) !== undefined,
  );
  const cluesKnown = revealed.every((clueId) => clueIds.has(clueId));
  // Кожне питання віднімає 1 і додає запис, а збій повертає все назад
  const budgetMatches = saved.questionsLeft + saved.log.length === detectiveCase.maxQuestions;
  const discoveredMatches =
    revealed.length === saved.discoveredClueIds.length &&
    revealed.every((clueId, index) => clueId === saved.discoveredClueIds[index]);
  const pendingValid =
    pending.length === 0 ||
    (pending.length === 1 && saved.status === 'investigating' && saved.log.at(-1)?.answer === null);

  return (
    entriesKnown &&
    cluesKnown &&
    budgetMatches &&
    discoveredMatches &&
    pendingValid &&
    isAccusationConsistent(saved, detectiveCase)
  );
}

function toLogEntry(entry: SavedEntry): LogEntry {
  const { answer } = entry;
  const restored: NpcAnswer | null =
    answer === null
      ? null
      : {
          statement: answer.statement,
          wasLie: answer.wasLie,
          ...(answer.revealedClueId !== undefined && { revealedClueId: answer.revealedClueId }),
        };

  return {
    id: entry.id,
    npcId: entry.npcId,
    topicId: entry.topicId,
    knownClueCount: entry.knownClueCount,
    answer: restored,
  };
}

/** undefined означає «збереження непридатне»: викликач починає нову партію. */
export function restoreGame(raw: unknown, detectiveCase: DetectiveCase): GameState | undefined {
  const parsed = savedGameSchema.safeParse(raw);
  if (!parsed.success) return undefined;

  const saved = parsed.data;
  if (saved.caseId !== detectiveCase.id || !isConsistent(saved, detectiveCase)) return undefined;

  return {
    detectiveCase,
    rules: saved.rules,
    status: saved.status,
    questionsLeft: saved.questionsLeft,
    discoveredClueIds: saved.discoveredClueIds,
    log: saved.log.map(toLogEntry),
    accusedId: saved.accusedId,
    error: null,
  };
}
