import type { DetectiveCase } from '../model/types';
import { isCharacter } from './queries';

export function validateCase(detectiveCase: DetectiveCase): string[] {
  const errors: string[] = [];
  const { entities, clues, culpritId, maxQuestions } = detectiveCase;
  const characters = entities.filter(isCharacter);
  const entityIds = new Set(entities.map((entity) => entity.id));
  const clueIds = new Set(clues.map((clue) => clue.id));

  const allIds = [...entities.map((e) => e.id), ...clues.map((c) => c.id)];
  const duplicates = new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index));
  if (duplicates.size > 0) {
    errors.push(`Дублікати id: ${[...duplicates].join(', ')}`);
  }

  if (!characters.some((character) => character.id === culpritId)) {
    errors.push('culpritId має вказувати на персонажа');
  }
  if (maxQuestions < 1) {
    errors.push('maxQuestions має бути ≥ 1');
  }

  for (const clue of clues) {
    for (const relatedId of clue.relatedEntityIds) {
      if (!entityIds.has(relatedId)) {
        errors.push(`Доказ "${clue.id}" посилається на невідому сутність "${relatedId}"`);
      }
    }
    const canBeRevealed = characters.some(
      (character) =>
        character.knownClueIds.includes(clue.id) && character.lies[clue.id] === undefined,
    );
    if (!canBeRevealed) {
      errors.push(`Доказ "${clue.id}" неможливо дізнатися: його ніхто не знає правдиво`);
    }
  }

  for (const character of characters) {
    for (const clueId of character.knownClueIds) {
      if (!clueIds.has(clueId)) {
        errors.push(`Персонаж "${character.id}" знає невідомий доказ "${clueId}"`);
      }
    }
    for (const clueId of Object.keys(character.lies)) {
      if (!character.knownClueIds.includes(clueId)) {
        errors.push(`Персонаж "${character.id}" бреше про доказ "${clueId}", якого не знає`);
      }
    }
  }

  const culpritIsExposable = clues.some((clue) => clue.relatedEntityIds.includes(culpritId));
  if (!culpritIsExposable) {
    errors.push('Жоден доказ не веде до винного');
  }

  return errors;
}

export function assertValidCase(detectiveCase: DetectiveCase): DetectiveCase {
  const errors = validateCase(detectiveCase);
  if (errors.length > 0) {
    throw new Error(`Некоректна справа "${detectiveCase.id}":\n${errors.join('\n')}`);
  }
  return detectiveCase;
}
