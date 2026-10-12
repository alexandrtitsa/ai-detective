import { describe, expect, it } from 'vitest';
import { officeDisappearanceBlueprint as blueprint } from '../../src/entities/case/lib/blueprint.fixture';
import { evaluateBlueprint } from './evaluate-blueprint';

const problemsOf = (raw: string) => {
  const result = evaluateBlueprint(raw);
  return result.ok ? '' : result.problems.join('\n');
};

describe('evaluateBlueprint', () => {
  it('приймає коректну справу', () => {
    expect(evaluateBlueprint(JSON.stringify(blueprint)).ok).toBe(true);
  });

  it('відхиляє не-JSON', () => {
    expect(problemsOf('не JSON')).toBe('Відповідь не є коректним JSON');
  });

  it('відхиляє порушення схеми й вказує шлях', () => {
    const raw = JSON.stringify({ ...blueprint, characters: blueprint.characters.slice(0, 1) });
    expect(problemsOf(raw)).toContain('characters');
  });

  it('відхиляє справу, де винний не бреше', () => {
    const raw = JSON.stringify({
      ...blueprint,
      knowledge: blueprint.knowledge.map((item) => ({ ...item, lie: '' })),
    });
    expect(problemsOf(raw)).toContain('не бреше');
  });
});
