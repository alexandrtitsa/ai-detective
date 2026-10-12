import { useId, type ReactNode } from 'react';
import styles from './Panel.module.scss';

interface PanelProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  const titleId = useId();

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
