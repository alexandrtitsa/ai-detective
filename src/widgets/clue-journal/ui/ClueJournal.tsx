import { AnimatePresence, motion } from 'motion/react';
import type { Clue } from '@/entities/case';
import { motionPresets } from '@/shared/lib';
import { Panel } from '@/shared/ui';
import styles from './ClueJournal.module.scss';

interface ClueJournalProps {
  readonly clues: readonly Clue[];
  readonly nameOf: (id: string) => string;
}

export function ClueJournal({ clues, nameOf }: ClueJournalProps) {
  return (
    <Panel title="Журнал доказів">
      {clues.length === 0 ? (
        <p className={styles.empty}>Доказів поки немає. Допитуй свідків, щоб їх знайти.</p>
      ) : (
        <ol className={styles.list}>
          <AnimatePresence initial={false}>
            {clues.map((clue) => (
              <motion.li key={clue.id} className={styles.item} {...motionPresets.listItem}>
                <p>{clue.text}</p>
                <ul aria-label="Повʼязано з" className={styles.tags}>
                  {clue.relatedEntityIds.map((id) => (
                    <li key={id} className={styles.tag}>
                      {nameOf(id)}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </Panel>
  );
}
