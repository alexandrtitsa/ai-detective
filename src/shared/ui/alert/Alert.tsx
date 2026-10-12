import type { ReactNode } from 'react';
import styles from './Alert.module.scss';

interface AlertProps {
  readonly children: ReactNode;
}

export function Alert({ children }: AlertProps) {
  return (
    <p role="alert" className={styles.alert}>
      {children}
    </p>
  );
}
