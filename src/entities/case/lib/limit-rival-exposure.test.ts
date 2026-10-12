import { describe, expect, it } from 'vitest';
import type { CaseBlueprint } from '../../../shared/api/contracts/case-contract';
import { analyzeCase } from './analyze-case';
import { blueprintToCase } from './blueprint-to-case';
import { officeDisappearanceBlueprint as blueprint } from './blueprint.fixture';
import { limitRivalExposure } from './limit-rival-exposure';

const problemsOf = (candidate: CaseBlueprint) => {
  const converted = blueprintToCase(candidate, 'test');
  return converted.ok ? analyzeCase(converted.value) : converted.problems;
};

const framed: CaseBlueprint = {
  ...blueprint,
  clues: blueprint.clues.map((clue) =>
    clue.key === 'deploy' || clue.key === 'laptop'
      ? { ...clue, relatedKeys: [...clue.relatedKeys, 'marina'] }
      : clue,
  ),
};

describe('limitRivalExposure', () => {
  it('не чіпає справу, де винний уже єдиний найбільш викритий', () => {
    expect(limitRivalExposure(blueprint)).toBe(blueprint);
  });

  it('прибирає ключі суперників, і справа стає розв’язною', () => {
    expect(problemsOf(framed).join('\n')).toContain('найбільш викритим');

    const fixed = limitRivalExposure(framed);
    expect(problemsOf(fixed)).toEqual([]);
    expect(fixed.culpritKey).toBe(framed.culpritKey);
    expect(fixed.knowledge).toEqual(framed.knowledge);
  });

  it('не лишає доказ без жодної зв’язки', () => {
    const fixed = limitRivalExposure(framed);
    expect(fixed.clues.every((clue) => clue.relatedKeys.length > 0)).toBe(true);
  });

  it('нічого не робить, якщо проти винного немає правдивих доказів', () => {
    const noEvidence: CaseBlueprint = {
      ...blueprint,
      knowledge: blueprint.knowledge.filter((item) => item.clueKey === 'alibi'),
    };
    expect(limitRivalExposure(noEvidence)).toBe(noEvidence);
  });
});
