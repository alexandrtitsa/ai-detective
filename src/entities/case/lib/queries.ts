import type { CaseEntity, Character, Clue, DetectiveCase } from '../model/types';

export function isCharacter(entity: CaseEntity): entity is Character {
  return entity.kind === 'character';
}

export function findEntity(detectiveCase: DetectiveCase, id: string): CaseEntity | undefined {
  return detectiveCase.entities.find((entity) => entity.id === id);
}

export function findCharacter(detectiveCase: DetectiveCase, id: string): Character | undefined {
  const entity = findEntity(detectiveCase, id);
  return entity !== undefined && isCharacter(entity) ? entity : undefined;
}

export function findClue(detectiveCase: DetectiveCase, id: string): Clue | undefined {
  return detectiveCase.clues.find((clue) => clue.id === id);
}

export function canTellAbout(detectiveCase: DetectiveCase, npcId: string, topicId: string): boolean {
  const npc = findCharacter(detectiveCase, npcId);
  if (npc === undefined) return false;
  return npc.knownClueIds.some(
    (clueId) => findClue(detectiveCase, clueId)?.relatedEntityIds.includes(topicId) === true,
  );
}

export function createNameResolver(detectiveCase: DetectiveCase): (id: string) => string {
  const names = new Map(detectiveCase.entities.map((entity) => [entity.id, entity.name] as const));
  return (id) => names.get(id) ?? id;
}
