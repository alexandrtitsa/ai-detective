import styles from './LiveRegion.module.scss';

interface LiveRegionProps {
  readonly message: string;
}

export function LiveRegion({ message }: LiveRegionProps) {
  return (
    <div role="status" className={styles.region}>
      {message}
    </div>
  );
}
