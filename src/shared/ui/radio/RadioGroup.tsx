import type { ReactNode } from 'react';
import styles from './Radio.module.scss';

interface RadioGroupProps {
  readonly legend: string;
  readonly children: ReactNode;
}

export function RadioGroup({ legend, children }: RadioGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}
