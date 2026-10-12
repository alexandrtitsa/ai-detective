import type { DetectiveCase, NpcContext, NpcFact } from '../model/types';
import { findCharacter, findClue } from './queries';

export function buildNpcContext(detectiveCase: DetectiveCase, npcId: string): NpcContext {
  const npc = findCharacter(detectiveCase, npcId);
  if (npc === undefined) {
    throw new Error(`NPC "${npcId}" не знайдено`);
  }

  const knowledge = npc.knownClueIds.flatMap((clueId): NpcFact[] => {
    const clue = findClue(detectiveCase, clueId);
    if (clue === undefined) return [];

    const lie = npc.lies[clueId];
    return [
      {
        clueId,
        relatedEntityIds: clue.relatedEntityIds,
        truth: clue.text,
        ...(lie !== undefined && { lie }),
      },
    ];
  });

  return {
    persona: { id: npc.id, name: npc.name, role: npc.role, description: npc.description },
    knowledge,
  };
}
