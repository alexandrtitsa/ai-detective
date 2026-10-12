import type { CaseBlueprint } from '../../../shared/api/contracts/case-contract';
import type { CaseEvent, Character, Clue, DetectiveCase, Item, Place } from '../model/types';

export type ConversionResult =
  | { readonly ok: true; readonly value: DetectiveCase }
  | { readonly ok: false; readonly problems: readonly string[] };

const ids = {
  character: (key: string) => `char-${key}`,
  location: (key: string) => `loc-${key}`,
  object: (key: string) => `obj-${key}`,
  event: (key: string) => `evt-${key}`,
  clue: (key: string) => `clue-${key}`,
} as const;

const MIN_QUESTIONS = 8;
const MAX_QUESTIONS = 16;
const QUESTIONS_PER_CLUE = 2;

function duplicatesOf(values: readonly string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function collectProblems(blueprint: CaseBlueprint): string[] {
  const problems: string[] = [];

  const entityKeys = [
    ...blueprint.characters,
    ...blueprint.locations,
    ...blueprint.objects,
    ...blueprint.events,
  ].map((item) => item.key);
  const clueKeys = blueprint.clues.map((clue) => clue.key);
  const entityKeySet = new Set(entityKeys);
  const clueKeySet = new Set(clueKeys);
  const characterKeys = new Set(blueprint.characters.map((item) => item.key));

  const duplicateEntities = duplicatesOf(entityKeys);
  if (duplicateEntities.length > 0) {
    problems.push(`Ключі сутностей мають бути унікальними, дублі: ${duplicateEntities.join(', ')}`);
  }
  const duplicateClues = duplicatesOf(clueKeys);
  if (duplicateClues.length > 0) {
    problems.push(`Ключі доказів мають бути унікальними, дублі: ${duplicateClues.join(', ')}`);
  }

  for (const clue of blueprint.clues) {
    for (const key of clue.relatedKeys) {
      if (!entityKeySet.has(key)) {
        problems.push(`Доказ "${clue.key}" посилається на невідому сутність "${key}"`);
      }
    }
  }

  for (const item of blueprint.knowledge) {
    if (!characterKeys.has(item.characterKey)) {
      problems.push(`knowledge: "${item.characterKey}" не є персонажем`);
    }
    if (!clueKeySet.has(item.clueKey)) {
      problems.push(`knowledge: невідомий доказ "${item.clueKey}"`);
    }
  }

  if (!characterKeys.has(blueprint.culpritKey)) {
    problems.push(`culpritKey "${blueprint.culpritKey}" має бути ключем персонажа`);
  }
  return problems;
}

/**
 * Пара «персонаж → доказ» може бути лише одна. Дубль це не смислова помилка, а артефакт
 * виправлень моделі, тож код залишає перший запис замість того, щоб відхиляти всю справу.
 */
function uniqueKnowledge(knowledge: CaseBlueprint['knowledge']): CaseBlueprint['knowledge'] {
  const seen = new Set<string>();
  return knowledge.filter((item) => {
    const pair = `${item.characterKey} → ${item.clueKey}`;
    if (seen.has(pair)) return false;
    seen.add(pair);
    return true;
  });
}

export function blueprintToCase(input: CaseBlueprint, id: string): ConversionResult {
  const blueprint: CaseBlueprint = { ...input, knowledge: uniqueKnowledge(input.knowledge) };
  const problems = collectProblems(blueprint);
  if (problems.length > 0) return { ok: false, problems };

  const entityIdByKey = new Map<string, string>([
    ...blueprint.characters.map((item) => [item.key, ids.character(item.key)] as const),
    ...blueprint.locations.map((item) => [item.key, ids.location(item.key)] as const),
    ...blueprint.objects.map((item) => [item.key, ids.object(item.key)] as const),
    ...blueprint.events.map((item) => [item.key, ids.event(item.key)] as const),
  ]);

  const characters = blueprint.characters.map((item): Character => {
    const known = blueprint.knowledge.filter((entry) => entry.characterKey === item.key);
    const lies = Object.fromEntries(
      known
        .filter((entry) => entry.lie.trim() !== '')
        .map((entry) => [ids.clue(entry.clueKey), entry.lie.trim()] as const),
    );

    return {
      kind: 'character',
      id: ids.character(item.key),
      name: item.name.trim(),
      role: item.role.trim(),
      description: item.description.trim(),
      knownClueIds: known.map((entry) => ids.clue(entry.clueKey)),
      lies,
    };
  });

  const locations = blueprint.locations.map((item): Place => ({
    kind: 'location',
    id: ids.location(item.key),
    name: item.name.trim(),
    description: item.description.trim(),
  }));
  const objects = blueprint.objects.map((item): Item => ({
    kind: 'object',
    id: ids.object(item.key),
    name: item.name.trim(),
    description: item.description.trim(),
  }));
  const events = blueprint.events.map((item): CaseEvent => ({
    kind: 'event',
    id: ids.event(item.key),
    name: item.name.trim(),
    description: item.description.trim(),
  }));

  const clues = blueprint.clues.map((clue): Clue => ({
    id: ids.clue(clue.key),
    text: clue.text.trim(),
    relatedEntityIds: clue.relatedKeys.flatMap((key) => {
      const entityId = entityIdByKey.get(key);
      return entityId === undefined ? [] : [entityId];
    }),
  }));

  return {
    ok: true,
    value: {
      id,
      title: blueprint.title.trim(),
      premise: blueprint.premise.trim(),
      entities: [...characters, ...locations, ...objects, ...events],
      clues,
      culpritId: ids.character(blueprint.culpritKey),
      maxQuestions: Math.min(
        MAX_QUESTIONS,
        Math.max(MIN_QUESTIONS, blueprint.clues.length * QUESTIONS_PER_CLUE),
      ),
    },
  };
}
