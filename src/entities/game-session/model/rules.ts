import type { LiePolicyId } from '@/entities/case';

export const REPEAT_POLICY_IDS = ['allow', 'block', 'new-evidence'] as const;
export type RepeatPolicy = (typeof REPEAT_POLICY_IDS)[number];

export const DIFFICULTIES = ['easy', 'normal', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface GameRules {
  readonly liePolicy: LiePolicyId;
  readonly repeatPolicy: RepeatPolicy;
}

export const RULES_BY_DIFFICULTY = {
  easy: { liePolicy: 'cracks', repeatPolicy: 'allow' },
  normal: { liePolicy: 'cracks', repeatPolicy: 'new-evidence' },
  hard: { liePolicy: 'always', repeatPolicy: 'block' },
} as const satisfies Record<Difficulty, GameRules>;

export const DEFAULT_RULES: GameRules = RULES_BY_DIFFICULTY.normal;
