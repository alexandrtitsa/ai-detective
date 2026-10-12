import { useState, type SubmitEvent } from 'react';
import type { DetectiveCase } from '@/entities/case';
import type { Difficulty } from '@/entities/game-session';
import { CaseGenerator } from '@/features/generate-case';
import { Button, Panel, RadioCard, RadioGroup } from '@/shared/ui';
import styles from './StartPage.module.scss';

const LEVELS = [
  {
    id: 'easy',
    title: 'Новачок',
    description: 'Свідки зізнаються, щойно в тебе є докази. Питання можна повторювати.',
  },
  {
    id: 'normal',
    title: 'Детектив',
    description:
      'Свідки зізнаються під тиском доказів. Повторити питання можна лише з новими доказами.',
  },
  {
    id: 'hard',
    title: 'Інспектор',
    description: 'Свідки брешуть до кінця. Повторювати питання не можна.',
  },
] as const satisfies readonly { id: Difficulty; title: string; description: string }[];

interface StartPageProps {
  readonly detectiveCase: DetectiveCase;
  readonly isGenerated: boolean;
  readonly onStart: (difficulty: Difficulty) => void;
  readonly onCaseGenerated: (detectiveCase: DetectiveCase) => void;
  readonly onSelectBuiltInCase: () => void;
}

export function StartPage({
  detectiveCase,
  isGenerated,
  onStart,
  onCaseGenerated,
  onSelectBuiltInCase,
}: StartPageProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStart(difficulty);
  };

  return (
    <div className={styles.page}>
      <section aria-labelledby="start-title" className={styles.intro}>
        <h1 id="start-title">{detectiveCase.title}</h1>
        <p>{detectiveCase.premise}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <RadioGroup legend="Складність">
            {LEVELS.map((level) => (
              <RadioCard
                key={level.id}
                name="difficulty"
                value={level.id}
                checked={level.id === difficulty}
                title={level.title}
                description={level.description}
                onSelect={() => setDifficulty(level.id)}
              />
            ))}
          </RadioGroup>
          <div className={styles.actions}>
            <Button type="submit">Почати розслідування</Button>
            {/* aria-disabled замість умовного рендеру: фокус не губиться після натискання */}
            <Button variant="secondary" aria-disabled={!isGenerated} onClick={onSelectBuiltInCase}>
              Вбудована справа
            </Button>
          </div>
        </form>
      </section>

      <Panel title="Нова справа від AI">
        <CaseGenerator onGenerated={onCaseGenerated} />
      </Panel>
    </div>
  );
}
