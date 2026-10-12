import { Button } from '@/shared/ui';
import { clearSavedProgress } from '../model/saved-progress';
import styles from './CrashScreen.module.scss';

export function CrashScreen() {
  const reload = () => {
    window.location.reload();
  };

  const resetAndReload = () => {
    clearSavedProgress();
    window.location.reload();
  };

  return (
    <main className={styles.screen}>
      <h1>Щось пішло не так</h1>
      <p>
        Сталася неочікувана помилка. Спробуй перезавантажити сторінку, а якщо вона повториться,
        скинь збережену гру.
      </p>
      <div className={styles.actions}>
        <Button onClick={reload}>Перезавантажити</Button>
        <Button variant="secondary" onClick={resetAndReload}>
          Скинути збережену гру
        </Button>
      </div>
    </main>
  );
}
