import { useId } from 'react';
import styles from './TextField.module.scss';

interface TextFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly hint?: string;
  readonly maxLength?: number;
}

export function TextField({ label, value, onChange, hint, maxLength }: TextFieldProps) {
  const id = useId();
  const hintId = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={styles.input}
        value={value}
        maxLength={maxLength}
        aria-describedby={hint === undefined ? undefined : hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint !== undefined && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
