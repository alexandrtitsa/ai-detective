import { describe, expect, it } from 'vitest';
import { officeDisappearanceCase as office } from '../model/office-disappearance';
import type { Character, Clue, DetectiveCase } from '../model/types';
import { analyzeCase } from './analyze-case';
import { checkSolvability } from './check-solvability';
import { isCharacter } from './queries';

function patchCharacter(id: string, patch: Partial<Character>): DetectiveCase {
  return {
    ...office,
    entities: office.entities.map((entity) =>
      isCharacter(entity) && entity.id === id ? { ...entity, ...patch } : entity,
    ),
  };
}

function patchClue(id: string, patch: Partial<Clue>): DetectiveCase {
  return {
    ...office,
    clues: office.clues.map((clue) => (clue.id === id ? { ...clue, ...patch } : clue)),
  };
}

const problemsOf = (detectiveCase: DetectiveCase) => checkSolvability(detectiveCase).join('\n');

describe('checkSolvability', () => {
  it('приймає вбудовану справу', () => {
    expect(analyzeCase(office)).toEqual([]);
  });

  it('вимагає, щоб винний брехав', () => {
    expect(problemsOf(patchCharacter('char-andriy', { lies: {} }))).toContain('не бреше');
  });

  it('вимагає достатньо доказів проти винного', () => {
    const weak = patchClue('clue-laptop', { relatedEntityIds: ['obj-laptop', 'loc-server-room'] });
    expect(problemsOf(weak)).toContain('Проти винного замало доказів');
  });

  it('вимагає, щоб винний був єдиним найбільш викритим', () => {
    const framed = patchClue('clue-badge', {
      relatedEntityIds: ['obj-badge', 'loc-server-room', 'char-marina'],
    });
    expect(problemsOf(framed)).toContain('найбільш викритим');
  });

  it('дозволяє персонажу знати кілька доказів про одну сутність', () => {
    const several = patchCharacter('char-iryna', {
      knownClueIds: ['clue-alibi', 'clue-laptop', 'clue-badge'],
    });
    expect(problemsOf(several)).not.toContain('кілька доказів');
  });

  it('забороняє персонажів, які нічого не знають', () => {
    expect(problemsOf(patchCharacter('char-marina', { knownClueIds: [] }))).toContain(
      'нічого не знає',
    );
  });

  it('analyzeCase повертає лише структурні помилки, якщо вони є', () => {
    const broken: DetectiveCase = { ...office, culpritId: 'loc-kitchen' };
    const problems = analyzeCase(broken);

    expect(problems).toContain('culpritId має вказувати на персонажа');
    expect(problems.join('\n')).not.toContain('не бреше');
  });
});
