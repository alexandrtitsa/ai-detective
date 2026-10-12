import { useId } from 'react';
import { isCharacter, type CaseEntity, type DetectiveCase, type EntityKind } from '@/entities/case';
import { Panel } from '@/shared/ui';
import styles from './CaseBoard.module.scss';

const GROUPS = [
  { kind: 'character', title: 'Персонажі' },
  { kind: 'location', title: 'Локації' },
  { kind: 'object', title: 'Предмети' },
  { kind: 'event', title: 'Події' },
] as const satisfies readonly { kind: EntityKind; title: string }[];

interface EntityGroupProps {
  readonly kind: EntityKind;
  readonly title: string;
  readonly entities: readonly CaseEntity[];
}

function EntityGroup({ kind, title, entities }: EntityGroupProps) {
  const headingId = useId();

  return (
    <div className={styles.group} data-kind={kind}>
      <h3 id={headingId} className={styles.groupTitle}>
        {title}
      </h3>
      <ul aria-labelledby={headingId} className={styles.list}>
        {entities.map((entity) => (
          <li key={entity.id} className={styles.card}>
            <p className={styles.name}>
              <strong>{entity.name}</strong>
              {isCharacter(entity) && <span className={styles.muted}>{entity.role}</span>}
            </p>
            <p className={styles.muted}>{entity.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CaseBoardProps {
  readonly detectiveCase: DetectiveCase;
}

export function CaseBoard({ detectiveCase }: CaseBoardProps) {
  return (
    <Panel title="Дошка справи">
      {GROUPS.map(({ kind, title }) => {
        const entities = detectiveCase.entities.filter((entity) => entity.kind === kind);
        return entities.length > 0 ? (
          <EntityGroup key={kind} kind={kind} title={title} entities={entities} />
        ) : null;
      })}
    </Panel>
  );
}
