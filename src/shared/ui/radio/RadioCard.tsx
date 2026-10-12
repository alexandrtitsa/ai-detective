import styles from './Radio.module.scss';

interface RadioCardProps {
  readonly name: string;
  readonly value: string;
  readonly checked: boolean;
  readonly title: string;
  readonly description: string;
  readonly onSelect: (value: string) => void;
}

export function RadioCard({ name, value, checked, title, description, onSelect }: RadioCardProps) {
  return (
    <label className={styles.card}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
      />
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
    </label>
  );
}
