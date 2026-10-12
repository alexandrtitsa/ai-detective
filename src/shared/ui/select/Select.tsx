import { useId } from 'react';
import styles from './Select.module.scss';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectProps {
  readonly label: string;
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (value: string) => void;
}

export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
