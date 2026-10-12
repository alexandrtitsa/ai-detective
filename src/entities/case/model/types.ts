export type EntityKind = 'character' | 'location' | 'object' | 'event';

interface BaseEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface Character extends BaseEntity {
  readonly kind: 'character';
  readonly role: string;
  readonly knownClueIds: readonly string[];
  readonly lies: Readonly<Record<string, string>>;
}

export interface Place extends BaseEntity {
  readonly kind: 'location';
}

export interface Item extends BaseEntity {
  readonly kind: 'object';
}

export interface CaseEvent extends BaseEntity {
  readonly kind: 'event';
}

export type CaseEntity = Character | Place | Item | CaseEvent;

export interface Clue {
  readonly id: string;
  readonly text: string;
  readonly relatedEntityIds: readonly string[];
}

export interface DetectiveCase {
  readonly id: string;
  readonly title: string;
  readonly premise: string;
  readonly entities: readonly CaseEntity[];
  readonly clues: readonly Clue[];
  readonly culpritId: string;
  readonly maxQuestions: number;
}

export interface NpcAnswer {
  readonly statement: string;
  readonly revealedClueId?: string;
  readonly wasLie: boolean;
}

/** Факт, який NPC знає про один доказ */
export interface NpcFact {
  readonly clueId: string;
  readonly relatedEntityIds: readonly string[];
  /** Правдива версія */
  readonly truth: string;
  /** Підготовлена брехня. Чи скористається нею NPC, вирішує LiePolicy */
  readonly lie?: string;
}

/** Усе, що NPC дозволено знати. Без culpritId, чужих знань і стану гри. */
export interface NpcContext {
  readonly persona: {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly description: string;
  };
  readonly knowledge: readonly NpcFact[];
}
