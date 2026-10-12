import type { LogEntry } from '@/entities/game-session';

export function buildAnnouncement(
  log: readonly LogEntry[],
  nameOf: (id: string) => string,
): string {
  const last = log.at(-1);
  if (last === undefined) return '';

  const npc = nameOf(last.npcId);
  if (last.answer === null) return `${npc} формулює відповідь…`;

  const clueNote = last.answer.revealedClueId === undefined ? '' : ' Знайдено новий доказ.';
  return `${npc} відповідає: ${last.answer.statement}${clueNote}`;
}
