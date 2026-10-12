import { useId, useState, type SubmitEvent } from 'react';
import type { Character } from '@/entities/case';
import { Button, ConfirmDialog, RadioCard, RadioGroup } from '@/shared/ui';
import styles from './AccusationForm.module.scss';

interface AccusationFormProps {
  readonly suspects: readonly Character[];
  readonly disabled: boolean;
  readonly onAccuse: (suspectId: string) => void;
}

export function AccusationForm({ suspects, disabled, onAccuse }: AccusationFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const groupName = useId();

  const selected = suspects.find((suspect) => suspect.id === selectedId);
  const canSubmit = !disabled && selected !== undefined;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (selected !== undefined) onAccuse(selected.id);
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <RadioGroup legend="Кого звинувачуємо?">
          {suspects.map((suspect) => (
            <RadioCard
              key={suspect.id}
              name={groupName}
              value={suspect.id}
              checked={suspect.id === selectedId}
              title={suspect.name}
              description={suspect.role}
              onSelect={setSelectedId}
            />
          ))}
        </RadioGroup>
        <div className={styles.actions}>
          <Button type="submit" variant="danger" aria-disabled={!canSubmit}>
            Звинуватити
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Підтвердити звинувачення"
        message={`Звинуватити ${selected?.name ?? ''}? Рішення остаточне: гра одразу завершиться.`}
        confirmLabel="Так, звинуватити"
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
