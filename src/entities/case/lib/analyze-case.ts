import type { DetectiveCase } from '../model/types';
import { checkSolvability } from './check-solvability';
import { validateCase } from './validate-case';

/** Структурна коректність, а якщо вона є, то й розв'язність. Порожній масив означає, що справу можна грати. */
export function analyzeCase(detectiveCase: DetectiveCase): string[] {
  const structural = validateCase(detectiveCase);
  return structural.length > 0 ? structural : checkSolvability(detectiveCase);
}

export function assertPlayableCase(detectiveCase: DetectiveCase): DetectiveCase {
  const problems = analyzeCase(detectiveCase);
  if (problems.length > 0) {
    throw new Error(`Справа "${detectiveCase.id}" непридатна для гри:\n${problems.join('\n')}`);
  }
  return detectiveCase;
}
