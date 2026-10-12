import type { NpcAnswer } from '@/entities/case';
import type { NpcRephraseRequest } from '@/shared/api';
import type { NpcDecisionInput } from '../model/types';

export function buildRephraseRequest(
  { context, topic }: NpcDecisionInput,
  decided: NpcAnswer,
): NpcRephraseRequest {
  const { name, role, description } = context.persona;

  return {
    persona: { name, role, description },
    topic: topic.name,
    statement: decided.statement,
  };
}
