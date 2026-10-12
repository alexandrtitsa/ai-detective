import type { CaseBlueprint } from '../../../shared/api/contracts/case-contract';

/** Докази, які хтось знає правдиво. Дубль пари «персонаж → доказ» ігнорується, як і в blueprintToCase. */
function truthfulClueKeys(knowledge: CaseBlueprint['knowledge']): Set<string> {
  const seen = new Set<string>();
  const truthful = new Set<string>();
  for (const item of knowledge) {
    const pair = `${item.characterKey} → ${item.clueKey}`;
    if (seen.has(pair)) continue;
    seen.add(pair);
    if (item.lie.trim() === '') truthful.add(item.clueKey);
  }
  return truthful;
}

/**
 * Не дає іншим персонажам бути викритими не менше за винного.
 *
 * «Викритість» персонажа це кількість правдиво відомих доказів, у relatedKeys яких він є (див.
 * checkSolvability). Модель вказує в relatedKeys кількох персонажів одразу, і нічия повторюється
 * попри пояснення в repair-промпті. Тож це вирішує код: зайві ключі суперників прибираються з
 * доказів, де вони не єдина зв'язка. Спершу з доказів без винного, потім з тих, що його містять.
 *
 * Винного, самі докази та хто що знає функція не змінює. Якщо у винного немає жодного
 * правдивого доказу, нічого не робить: це проблема справи, а не суперників.
 */
export function limitRivalExposure(blueprint: CaseBlueprint): CaseBlueprint {
  const truthful = truthfulClueKeys(blueprint.knowledge);
  const { culpritKey } = blueprint;
  let clues = blueprint.clues;

  const exposureOf = (key: string) =>
    clues.filter((clue) => truthful.has(clue.key) && clue.relatedKeys.includes(key)).length;

  const culpritExposure = exposureOf(culpritKey);
  if (culpritExposure === 0) return blueprint;

  for (const character of blueprint.characters) {
    if (character.key === culpritKey) continue;

    const strippable = clues
      .filter(
        (clue) =>
          truthful.has(clue.key) &&
          clue.relatedKeys.includes(character.key) &&
          clue.relatedKeys.length > 1,
      )
      .sort(
        (a, b) =>
          Number(a.relatedKeys.includes(culpritKey)) - Number(b.relatedKeys.includes(culpritKey)),
      );

    for (const target of strippable) {
      if (exposureOf(character.key) < culpritExposure) break;
      clues = clues.map((clue) =>
        clue.key === target.key
          ? { ...clue, relatedKeys: clue.relatedKeys.filter((key) => key !== character.key) }
          : clue,
      );
    }
  }

  return clues === blueprint.clues ? blueprint : { ...blueprint, clues };
}
