import { describe, expect, it } from 'vitest';
import type { CaseBlueprint } from '../../../shared/api/contracts/case-contract';
import { officeDisappearanceCase } from '../model/office-disappearance';
import { blueprintToCase, type ConversionResult } from './blueprint-to-case';
import { officeDisappearanceBlueprint as blueprint } from './blueprint.fixture';

const convert = (patch: Partial<CaseBlueprint>) =>
  blueprintToCase({ ...blueprint, ...patch }, 'test');
const problemsOf = (result: ConversionResult) => (result.ok ? [] : result.problems).join('\n');

describe('blueprintToCase', () => {
  it('відтворює вбудовану справу один у один', () => {
    expect(blueprintToCase(blueprint, 'office-disappearance')).toEqual({
      ok: true,
      value: officeDisappearanceCase,
    });
  });

  it('відхиляє дублі ключів сутностей', () => {
    const result = convert({
      locations: [...blueprint.locations, { key: 'marina', name: 'Х', description: 'Х' }],
    });
    expect(problemsOf(result)).toContain('унікальними');
  });

  it('відхиляє доказ із невідомою сутністю', () => {
    const result = convert({
      clues: [{ key: 'ghost', text: 'Факт', relatedKeys: ['nobody'] }, ...blueprint.clues],
    });
    expect(problemsOf(result)).toContain('невідому сутність');
  });

  it('відхиляє knowledge з невідомими посиланнями', () => {
    const result = convert({
      knowledge: [...blueprint.knowledge, { characterKey: 'kitchen', clueKey: 'nope', lie: '' }],
    });
    expect(problemsOf(result)).toContain('не є персонажем');
    expect(problemsOf(result)).toContain('невідомий доказ');
  });

  it('залишає перший запис, коли пара персонаж → доказ продубльована', () => {
    const result = convert({
      knowledge: [...blueprint.knowledge, { characterKey: 'marina', clueKey: 'badge', lie: 'Ні' }],
    });
    expect(result.ok && result.value).toEqual({ ...officeDisappearanceCase, id: 'test' });
  });

  it('вимагає, щоб винний був персонажем', () => {
    expect(problemsOf(convert({ culpritKey: 'kitchen' }))).toContain('culpritKey');
  });

  it('обмежує ліміт питань зверху', () => {
    const clues = Array.from({ length: 9 }, (_, index) => ({
      key: `c${String(index)}`,
      text: 'Факт',
      relatedKeys: ['marina'],
    }));
    const result = convert({ clues, knowledge: [] });

    expect(result.ok && result.value.maxQuestions).toBe(16);
  });
});
