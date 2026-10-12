import styles from './Spinner.module.scss';

export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}
