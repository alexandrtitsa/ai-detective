import type { Character, DetectiveCase } from '../model/types';
import { isCharacter } from './queries';

/** Скільки доказів проти винного гравець має змогу отримати чесно */
const MIN_CULPRIT_EVIDENCE = 2;

const label = (character: Character) => `"${character.name}" (${character.id})`;

/**
 * Перевірки «чи можна цю справу розкрити». Припускає структурно коректну справу (див. validateCase).
 *
 * Кілька доказів про одну сутність в одного персонажа дозволені: resolveNpcAnswer спершу віддає
 * ще не відкритий факт, тож повторне питання розкриває наступний. Заборона цього шаблону робила
 * справи з однією центральною сутністю (крадіжка, винний) математично нерозв'язними для генератора.
 * Порожній масив означає, що справа розв'язна.
 */
export function checkSolvability(detectiveCase: DetectiveCase): string[] {
  const characters = detectiveCase.entities.filter(isCharacter);
  const culprit = characters.find((character) => character.id === detectiveCase.culpritId);
  if (culprit === undefined) return ['culpritId має вказувати на персонажа'];

  const problems: string[] = [];

  // Докази, які хтось може розкрити чесно (без підготовленої брехні)
  const obtainable = new Set(
    characters.flatMap((character) =>
      character.knownClueIds.filter((clueId) => character.lies[clueId] === undefined),
    ),
  );
  const evidenceAgainst = (entityId: string) =>
    detectiveCase.clues.filter(
      (clue) => obtainable.has(clue.id) && clue.relatedEntityIds.includes(entityId),
    ).length;

  if (Object.keys(culprit.lies).length === 0) {
    problems.push(`Винний ${label(culprit)} не бреше: перехресна перевірка нічого не викриє`);
  }

  const culpritEvidence = evidenceAgainst(culprit.id);
  if (culpritEvidence < MIN_CULPRIT_EVIDENCE) {
    problems.push(
      `Проти винного замало доказів, які можна отримати чесно: ${String(culpritEvidence)} з ${String(MIN_CULPRIT_EVIDENCE)}`,
    );
  }

  const equallyImplicated = characters.filter(
    (character) => character.id !== culprit.id && evidenceAgainst(character.id) >= culpritEvidence,
  );
  if (equallyImplicated.length > 0) {
    // Лічильники в тексті: модель бачить, наскільки не вистачає, і може виправити конкретно
    const others = equallyImplicated
      .map((character) => `${label(character)}: ${String(evidenceAgainst(character.id))}`)
      .join(', ');
    problems.push(
      `Винний ${label(culprit)} має бути єдиним найбільш викритим (у нього ${String(culpritEvidence)} правдивих доказів), але не менш викриті: ${others}`,
    );
  }

  for (const character of characters) {
    if (character.knownClueIds.length === 0) {
      problems.push(`Персонаж ${label(character)} нічого не знає: допит буде марним`);
    }
  }

  return problems;
}
