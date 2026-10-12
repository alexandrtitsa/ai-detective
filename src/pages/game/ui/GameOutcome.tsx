import { useEffect, useId, useRef } from 'react';
import { motion } from 'motion/react';
import { cx, motionPresets } from '@/shared/lib';
import { Button } from '@/shared/ui';
import styles from './GameOutcome.module.scss';

interface GameOutcomeProps {
  readonly won: boolean;
  readonly onContinue: () => void;
}

export function GameOutcome({ won, onContinue }: GameOutcomeProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <motion.section
      className={cx(styles.outcome, won ? styles.won : styles.lost)}
      aria-labelledby={headingId}
      {...motionPresets.pop}
    >
      <h2 ref={headingRef} id={headingId} tabIndex={-1} className={styles.title}>
        {won ? 'Справу розкрито!' : 'Звинувачення хибне'}
      </h2>
      <p>{won ? 'Ти знайшов винного.' : 'Винного не викрито. Спробуй ще раз.'}</p>
      <Button onClick={onContinue}>До результатів</Button>
    </motion.section>
  );
}
