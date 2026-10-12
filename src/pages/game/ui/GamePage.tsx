import { useMemo, useState } from 'react';
import {
  canTellAbout,
  createNameResolver,
  isCharacter,
  type DetectiveCase,
} from '@/entities/case';
import { RULES_BY_DIFFICULTY, type Difficulty } from '@/entities/game-session';
import { createNpcResponder } from '@/features/ai-npc-reply';
import { AccusationForm } from '@/features/make-accusation';
import { Button, ConfirmDialog, Panel } from '@/shared/ui';
import { CaseBoard } from '@/widgets/case-board';
import { ClueJournal } from '@/widgets/clue-journal';
import { InterrogationPanel } from '@/widgets/interrogation-panel';
import { useGameLogic } from '../model/use-game-logic';
import { GameOutcome } from './GameOutcome';
import styles from './GamePage.module.scss';

const responder = createNpcResponder();

interface GamePageProps {
  readonly detectiveCase: DetectiveCase;
  readonly difficulty: Difficulty;
  readonly onFinish: () => void;
  readonly onExit: () => void;
}

export function GamePage({ detectiveCase, difficulty, onFinish, onExit }: GamePageProps) {
  const characters = useMemo(() => detectiveCase.entities.filter(isCharacter), [detectiveCase]);
  const nameOf = useMemo(() => createNameResolver(detectiveCase), [detectiveCase]);
  const [isExitOpen, setExitOpen] = useState(false);

  const game = useGameLogic(detectiveCase, responder, RULES_BY_DIFFICULTY[difficulty]);
  const { state } = game;
  const isFinished = state.status !== 'investigating';

  const handleExit = () => {
    setExitOpen(false);
    onExit();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{detectiveCase.title}</h1>
          <p className={styles.premise}>{detectiveCase.premise}</p>
        </div>
        <Button variant="secondary" onClick={() => setExitOpen(true)}>
          Вийти з гри
        </Button>
      </header>

      {isFinished && <GameOutcome won={state.status === 'won'} onContinue={onFinish} />}

      <div className={styles.layout}>
        <CaseBoard detectiveCase={detectiveCase} />

        <InterrogationPanel
          characters={characters}
          topics={detectiveCase.entities}
          log={state.log}
          questionsLeft={state.questionsLeft}
          checkAsk={game.checkAsk}
          wasAsked={game.wasAsked}
          canTell={
            difficulty === 'hard'
              ? undefined
              : (npcId, topicId) => canTellAbout(detectiveCase, npcId, topicId)
          }
          error={state.error}
          nameOf={nameOf}
          onAsk={game.askNpc}
        />

        <div className={styles.sidebar}>
          <ClueJournal clues={game.discoveredClues} nameOf={nameOf} />
          <Panel title="Звинувачення">
            <AccusationForm
              suspects={characters}
              disabled={isFinished || game.isNpcThinking}
              onAccuse={game.accuse}
            />
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={isExitOpen}
        title="Вийти з розслідування?"
        message="Прогрес цієї гри буде втрачено."
        confirmLabel="Так, вийти"
        onConfirm={handleExit}
        onClose={() => setExitOpen(false)}
      />
    </div>
  );
}
