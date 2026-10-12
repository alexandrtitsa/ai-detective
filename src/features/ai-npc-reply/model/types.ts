import type { DetectiveCase, LiePolicyId, NpcAnswer, NpcContext } from '@/entities/case';

export interface NpcQuery {
  readonly detectiveCase: DetectiveCase;
  readonly npcId: string;
  readonly topicId: string;
  readonly discoveredClueIds: readonly string[];
  readonly liePolicy: LiePolicyId;
}

export interface NpcDecisionInput {
  readonly context: NpcContext;
  readonly topic: { readonly id: string; readonly name: string };
  readonly discoveredClueIds: readonly string[];
  readonly liePolicy: LiePolicyId;
}

export interface NpcResponder {
  answer(query: NpcQuery, signal?: AbortSignal): Promise<NpcAnswer>;
}
