import { useId, useState, type SubmitEvent } from 'react';
import type { CaseEntity, Character } from '@/entities/case';
import type { AskCheck } from '@/entities/game-session';
import { Button, Select } from '@/shared/ui';
import { describeAskBlock } from '../lib/describe-ask-block';
import styles from './QuestionForm.module.scss';

interface QuestionFormProps {
  readonly characters: readonly Character[];
  readonly topics: readonly CaseEntity[];
  readonly checkAsk: (npcId: string, topicId: string) => AskCheck;
  readonly wasAsked: (npcId: string, topicId: string) => boolean;
  /** Підказка «є що розповісти». undefined вимикає її (найвища складність) */
  readonly canTell: ((npcId: string, topicId: string) => boolean) | undefined;
  readonly onAsk: (npcId: string, topicId: string) => void;
}

function topicLabel(name: string, marks: { canTell: boolean; asked: boolean }): string {
  const notes: string[] = [];
  if (marks.canTell) notes.push('є що розповісти');
  if (marks.asked) notes.push('вже питали');
  return notes.length === 0 ? name : `${name} (${notes.join(', ')})`;
}

export function QuestionForm({
  characters,
  topics,
  checkAsk,
  wasAsked,
  canTell,
  onAsk,
}: QuestionFormProps) {
  const [npcId, setNpcId] = useState(characters[0]?.id ?? '');
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '');
  const hintId = useId();

  const check = checkAsk(npcId, topicId);
  const hint = check.ok ? null : describeAskBlock(check.reason);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (check.ok) onAsk(npcId, topicId);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Select
        label="Кого допитуємо"
        value={npcId}
        options={characters.map(({ id, name, role }) => ({ value: id, label: `${name}, ${role}` }))}
        onChange={setNpcId}
      />
      <Select
        label="Про що питаємо"
        value={topicId}
        options={topics.map(({ id, name }) => ({
          value: id,
          label: topicLabel(name, {
            canTell: canTell?.(npcId, id) === true,
            asked: wasAsked(npcId, id),
          }),
        }))}
        onChange={setTopicId}
      />
      <div className={styles.actions}>
        {/* aria-disabled замість disabled: кнопка лишається у фокусі, а причину читає aria-describedby */}
        <Button
          type="submit"
          aria-disabled={!check.ok}
          aria-describedby={hint === null ? undefined : hintId}
        >
          Запитати
        </Button>
      </div>
      {hint !== null && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </form>
  );
}
