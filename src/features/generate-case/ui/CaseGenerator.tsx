import { useState, type SubmitEvent } from 'react';
import type { DetectiveCase } from '@/entities/case';
import { useGenerateCase } from '../model/use-generate-case';
import styles from './CaseGenerator.module.scss';
import { Alert, Button, LiveRegion, Select, Spinner, TextField } from '@/shared/ui';

const CAST_OPTIONS = [3, 4, 5].map((size) => ({
  value: String(size),
  label: `Підозрюваних: ${String(size)}`,
}));

interface CaseGeneratorProps {
  readonly onGenerated: (detectiveCase: DetectiveCase) => void;
}

export function CaseGenerator({ onGenerated }: CaseGeneratorProps) {
  const [theme, setTheme] = useState('');
  const [castSize, setCastSize] = useState('4');
  const { status, error, generate, cancel } = useGenerateCase(onGenerated);
  const isGenerating = status === 'generating';

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGenerating) return;

    const trimmed = theme.trim();
    generate({ castSize: Number(castSize), ...(trimmed !== '' && { theme: trimmed }) });
  };

  const announcement = {
    idle: '',
    error: '',
    generating: 'Генеруємо справу. Це може тривати до хвилини.',
    done: 'Нову справу згенеровано.',
  }[status];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label="Тема (необов’язково)"
        hint="Наприклад: зникла кава в офісі, крадіжка у кав’ярні"
        maxLength={120}
        value={theme}
        onChange={setTheme}
      />
      <Select label="Розмір касту" value={castSize} options={CAST_OPTIONS} onChange={setCastSize} />

      <div className={styles.actions}>
        {/* aria-disabled замість disabled: кнопка лишається у фокусі під час генерації */}
        <Button type="submit" aria-disabled={isGenerating}>
          Згенерувати справу
        </Button>
        {isGenerating && (
          <Button variant="secondary" onClick={cancel}>
            Скасувати
          </Button>
        )}
      </div>

      {isGenerating && (
        <p className={styles.progress}>
          <Spinner /> Генеруємо справу… це може тривати до хвилини.
        </p>
      )}
      {error !== null && <Alert>{error}</Alert>}
      <LiveRegion message={announcement} />
    </form>
  );
}
