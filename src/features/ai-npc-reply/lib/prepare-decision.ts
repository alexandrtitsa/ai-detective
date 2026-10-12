import { buildNpcContext, findEntity } from '@/entities/case';
import type { NpcDecisionInput, NpcQuery } from '../model/types';

export function prepareDecision(query: NpcQuery): NpcDecisionInput {
  const topic = findEntity(query.detectiveCase, query.topicId);
  if (topic === undefined) {
    throw new Error(`Тему "${query.topicId}" не знайдено`);
  }

  return {
    context: buildNpcContext(query.detectiveCase, query.npcId),
    topic: { id: topic.id, name: topic.name },
    discoveredClueIds: query.discoveredClueIds,
    liePolicy: query.liePolicy,
  };
}
