import { describe, expect, it } from 'vitest';
import { isFaithful } from './is-faithful';

describe('isFaithful', () => {
  it('приймає перефразування зі збереженим часом', () => {
    expect(isFaithful('Бейдж відмітився о 02:14.', 'Ага, його бейдж пікнув о 02:14.')).toBe(true);
  });

  it('відхиляє змінений час', () => {
    expect(isFaithful('Бейдж відмітився о 02:14.', 'Здається, о 03:00.')).toBe(false);
  });

  it('відхиляє вигадане число, якого не було в оригіналі', () => {
    expect(isFaithful('Нічого про це не знаю.', 'Не знаю, було десь о 02:10.')).toBe(false);
  });

  it('приймає репліку без чисел', () => {
    expect(isFaithful('Нічого про це не знаю.', 'Вперше про це чую.')).toBe(true);
  });
});
