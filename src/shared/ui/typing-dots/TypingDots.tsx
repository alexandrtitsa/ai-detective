import styles from './TypingDots.module.scss';

export function TypingDots() {
  return (
    <span className={styles.dots} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
