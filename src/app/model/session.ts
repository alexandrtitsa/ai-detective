import { z } from 'zod';
import {
  analyzeCase,
  assertPlayableCase,
  detectiveCaseSchema,
  officeDisappearanceCase,
  type DetectiveCase,
} from '@/entities/case';
import { DIFFICULTIES, type Difficulty } from '@/entities/game-session';

export type Phase = 'start' | 'game' | 'result';

export interface ActiveCase {
  readonly detectiveCase: DetectiveCase;
  readonly isGenerated: boolean;
}

export interface Session {
  readonly phase: Phase;
  readonly difficulty: Difficulty;
  readonly activeCase: ActiveCase;
}

export const SESSION_KEY = 'ai-detective:session:v1';
const SESSION_VERSION = 1;

export const BUILT_IN_CASE: ActiveCase = {
  detectiveCase: assertPlayableCase(officeDisappearanceCase),
  isGenerated: false,
};

export const INITIAL_SESSION: Session = {
  phase: 'start',
  difficulty: 'normal',
  activeCase: BUILT_IN_CASE,
};

const savedSessionSchema = z.object({
  version: z.literal(SESSION_VERSION),
  phase: z.enum(['start', 'game']),
  difficulty: z.enum(DIFFICULTIES),
  isGenerated: z.boolean(),
  detectiveCase: detectiveCaseSchema,
});

export function serializeSession(session: Session) {
  return {
    version: SESSION_VERSION,
    phase: session.phase === 'result' ? 'start' : session.phase,
    difficulty: session.difficulty,
    isGenerated: session.activeCase.isGenerated,
    detectiveCase: session.activeCase.detectiveCase,
  };
}

export function restoreSession(raw: unknown): Session | undefined {
  const parsed = savedSessionSchema.safeParse(raw);
  if (!parsed.success) return undefined;

  const { phase, difficulty, isGenerated, detectiveCase } = parsed.data;
  if (analyzeCase(detectiveCase).length > 0) return undefined;

  return { phase, difficulty, activeCase: { detectiveCase, isGenerated } };
}
