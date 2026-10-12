import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase } from '../model/office-disappearance';
import type { DetectiveCase } from '../model/types';
import { validateCase } from './validate-case';

describe('validateCase', () => {
  it('приймає мок-справу', () => {
    expect(validateCase(officeDisappearanceCase)).toEqual([]);
  });

  it('відхиляє винного, який не є персонажем', () => {
    const broken: DetectiveCase = { ...officeDisappearanceCase, culpritId: 'loc-kitchen' };
    expect(validateCase(broken)).toContain('culpritId має вказувати на персонажа');
  });

  it('знаходить докази, яких ніхто не може розкрити правдиво', () => {
    const broken: DetectiveCase = {
      ...officeDisappearanceCase,
      entities: officeDisappearanceCase.entities.map((entity) =>
        entity.kind === 'character' && entity.id === 'char-marina'
          ? { ...entity, knownClueIds: [] }
          : entity,
      ),
    };
    expect(validateCase(broken)).toContainEqual(expect.stringContaining('clue-badge'));
  });
});
