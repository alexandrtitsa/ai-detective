import { describe, expect, it } from 'vitest';
import type { LogEntry } from '@/entities/game-session';
import { buildAnnouncement } from './build-announcement';

const names: Record<string, string> = { 'char-iryna': 'Ірина', 'char-andriy': 'Андрій' };
const nameOf = (id: string) => names[id] ?? id;
const pending: LogEntry = {
  id: 'q1',
  npcId: 'char-iryna',
  topicId: 'char-andriy',
  knownClueCount: 0,
  answer: null,
};

describe('buildAnnouncement', () => {
  it('повертає порожній рядок, поки допитів не було', () => {
    expect(buildAnnouncement([], nameOf)).toBe('');
  });

  it('повідомляє, що NPC формулює відповідь', () => {
    expect(buildAnnouncement([pending], nameOf)).toBe('Ірина формулює відповідь…');
  });

  it('озвучує відповідь NPC', () => {
    const answered: LogEntry = {
      ...pending,
      answer: { statement: 'Нічого не бачила.', wasLie: false },
    };
    expect(buildAnnouncement([answered], nameOf)).toBe('Ірина відповідає: Нічого не бачила.');
  });

  it('додає повідомлення про новий доказ і бере лише останній запис', () => {
    const first: LogEntry = {
      ...pending,
      id: 'q0',
      answer: { statement: 'Стара відповідь.', wasLie: false },
    };
    const last: LogEntry = {
      ...pending,
      answer: { statement: 'Бачила ноутбук.', wasLie: false, revealedClueId: 'clue-laptop' },
    };
    expect(buildAnnouncement([first, last], nameOf)).toBe(
      'Ірина відповідає: Бачила ноутбук. Знайдено новий доказ.',
    );
  });
});
