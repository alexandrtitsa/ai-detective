import { useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LogEntry } from '@/entities/game-session';
import { motionPresets } from '@/shared/lib';
import { TypingDots } from '@/shared/ui';
import styles from './InterrogationLog.module.scss';

interface InterrogationLogProps {
  readonly log: readonly LogEntry[];
  readonly nameOf: (id: string) => string;
}

export function InterrogationLog({ log, nameOf }: InterrogationLogProps) {
  const headingId = useId();

  return (
    <div className={styles.root}>
      <h3 id={headingId} className={styles.heading}>
        Протокол допитів
      </h3>
      {log.length === 0 ? (
        <p className={styles.empty}>Ти ще нікого не допитав.</p>
      ) : (
        <ol reversed aria-labelledby={headingId} className={styles.list}>
          <AnimatePresence initial={false}>
            {log.toReversed().map((entry) => (
              <motion.li
                key={entry.id}
                layout="position"
                className={styles.entry}
                {...motionPresets.listItem}
              >
                <p className={styles.question}>
                  <strong>{nameOf(entry.npcId)}</strong> про «{nameOf(entry.topicId)}»
                </p>
                {entry.answer === null ? (
                  <p className={styles.pending}>
                    Формулює відповідь <TypingDots />
                  </p>
                ) : (
                  <>
                    <p className={styles.answer}>{entry.answer.statement}</p>
                    {entry.answer.revealedClueId !== undefined && (
                      <p className={styles.badge}>Новий доказ</p>
                    )}
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </div>
  );
}
