import type { CaseEntity, Character } from '@/entities/case';
import type { AskCheck, LogEntry } from '@/entities/game-session';
import { QuestionForm } from '@/features/ask-npc';
import { Alert, LiveRegion, Panel } from '@/shared/ui';
import { buildAnnouncement } from '../lib/build-announcement';
import { InterrogationLog } from './InterrogationLog';
import styles from './InterrogationPanel.module.scss';

interface InterrogationPanelProps {
  readonly characters: readonly Character[];
  readonly topics: readonly CaseEntity[];
  readonly log: readonly LogEntry[];
  readonly questionsLeft: number;
  readonly checkAsk: (npcId: string, topicId: string) => AskCheck;
  readonly wasAsked: (npcId: string, topicId: string) => boolean;
  readonly canTell: ((npcId: string, topicId: string) => boolean) | undefined;
  readonly error: string | null;
  readonly nameOf: (id: string) => string;
  readonly onAsk: (npcId: string, topicId: string) => void;
}

export function InterrogationPanel({
  characters,
  topics,
  log,
  questionsLeft,
  checkAsk,
  wasAsked,
  canTell,
  error,
  nameOf,
  onAsk,
}: InterrogationPanelProps) {
  return (
    <Panel title="Допит">
      <p className={styles.counter}>
        Залишилось питань: <strong>{questionsLeft}</strong>
      </p>
      <QuestionForm
        characters={characters}
        topics={topics}
        checkAsk={checkAsk}
        wasAsked={wasAsked}
        canTell={canTell}
        onAsk={onAsk}
      />
      {error !== null && <Alert>{error}</Alert>}
      {/* Під час помилки статус мовчить: її оголошує role="alert", а стара відповідь не повторюється */}
      <LiveRegion message={error === null ? buildAnnouncement(log, nameOf) : ''} />
      <InterrogationLog log={log} nameOf={nameOf} />
    </Panel>
  );
}
