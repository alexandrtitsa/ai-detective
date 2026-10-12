import { LIE_POLICIES, type NpcAnswer } from '@/entities/case';
import type { NpcDecisionInput } from '../model/types';

const UNKNOWN_STATEMENT = 'Нічого про це не знаю.';

export function resolveNpcAnswer(input: NpcDecisionInput): NpcAnswer {
  const { context, topic, discoveredClueIds, liePolicy } = input;

  const facts = context.knowledge.filter((item) => item.relatedEntityIds.includes(topic.id));
  const fact = facts.find((item) => !discoveredClueIds.includes(item.clueId)) ?? facts[0];

  if (fact === undefined) {
    return { statement: UNKNOWN_STATEMENT, wasLie: false };
  }

  const { lie } = fact;
  if (lie !== undefined && LIE_POLICIES[liePolicy]({ fact, discoveredClueIds })) {
    return { statement: lie, wasLie: true };
  }

  return { statement: fact.truth, revealedClueId: fact.clueId, wasLie: false };
}
