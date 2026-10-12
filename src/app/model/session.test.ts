import { describe, expect, it } from 'vitest';
import { isCharacter, officeDisappearanceCase } from '@/entities/case';
import { INITIAL_SESSION, restoreSession, serializeSession, type Session } from './session';

const generated: Session = {
  phase: 'game',
  difficulty: 'hard',
  activeCase: { detectiveCase: officeDisappearanceCase, isGenerated: true },
};

const roundTrip = (session: Session) => restoreSession(structuredClone(serializeSession(session)));

describe('сесія застосунку', () => {
  it('відновлює збережену сесію', () => {
    expect(roundTrip(generated)).toEqual(generated);
  });

  it('фазу результату зберігає як початок', () => {
    expect(roundTrip({ ...generated, phase: 'result' })?.phase).toBe('start');
  });

  it('відхиляє справу, яка не проходить перевірки', () => {
    const broken = {
      ...officeDisappearanceCase,
      entities: officeDisappearanceCase.entities.map((entity) =>
        isCharacter(entity) && entity.id === 'char-andriy' ? { ...entity, lies: {} } : entity,
      ),
    };
    const session: Session = {
      ...INITIAL_SESSION,
      activeCase: { detectiveCase: broken, isGenerated: true },
    };

    expect(roundTrip(session)).toBeUndefined();
  });

  it.each([
    ['рядок', 'x'],
    ['null', null],
    ['undefined', undefined],
  ])('відхиляє сміття: %s', (_name, raw) => {
    expect(restoreSession(raw)).toBeUndefined();
  });
});
