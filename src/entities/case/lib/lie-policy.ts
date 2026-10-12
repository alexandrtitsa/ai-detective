import type { NpcFact } from '../model/types';

export const LIE_POLICY_IDS = ['never', 'always', 'cracks'] as const;
export type LiePolicyId = (typeof LIE_POLICY_IDS)[number];

export interface LieDecisionInput {
  readonly fact: NpcFact;
  /** Докази, які гравець уже знайшов */
  readonly discoveredClueIds: readonly string[];
}

export type LiePolicy = (input: LieDecisionInput) => boolean;

export const LIE_POLICIES: Readonly<Record<LiePolicyId, LiePolicy>> = {
  never: () => false,
  always: () => true,
  cracks: ({ fact, discoveredClueIds }) => !discoveredClueIds.includes(fact.clueId),
};
