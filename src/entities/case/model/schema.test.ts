import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase } from './office-disappearance';
import { detectiveCaseSchema } from './schema';

describe('detectiveCaseSchema', () => {
  it('приймає вбудовану справу після серіалізації', () => {
    const parsed = detectiveCaseSchema.safeParse(structuredClone(officeDisappearanceCase));

    expect(parsed.success && parsed.data).toEqual(officeDisappearanceCase);
  });

  it('відхиляє невідомий вид сутності', () => {
    const broken = {
      ...officeDisappearanceCase,
      entities: [{ kind: 'monster', id: 'x', name: 'Y', description: '' }],
    };

    expect(detectiveCaseSchema.safeParse(broken).success).toBe(false);
  });

  it('відхиляє справу без обов’язкових полів', () => {
    expect(detectiveCaseSchema.safeParse({ id: 'x' }).success).toBe(false);
    expect(detectiveCaseSchema.safeParse(null).success).toBe(false);
  });
});
