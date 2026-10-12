import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, m, MotionConfig } from 'motion/react';
import type { DetectiveCase } from '@/entities/case';
import { clearSavedGame, type Difficulty } from '@/entities/game-session';
import { ResultPage } from '@/pages/result';
import { StartPage } from '@/pages/start';
import { assertNever, loadMotionFeatures, motionPresets } from '@/shared/lib';
import { Spinner } from '@/shared/ui';
import styles from './App.module.scss';
import { loadInitialSession, saveSession } from './model/saved-progress';
import { BUILT_IN_CASE, type Phase, type Session } from './model/session';

const GamePage = lazy(() => import('@/pages/game').then((module) => ({ default: module.GamePage })));

const TITLES = {
  start: 'Нова справа',
  game: 'Розслідування',
  result: 'Результат',
} as const satisfies Record<Phase, string>;

export function App() {
  const [session, setSession] = useState<Session>(loadInitialSession);
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const { phase } = session;

  useEffect(() => {
    saveSession(session);
  }, [session]);
  useEffect(() => {
    document.title = `${TITLES[phase]} · AI Detective`;
  }, [phase]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [phase]);

  const goTo = useCallback((next: Phase) => {
    setSession((current) => ({ ...current, phase: next }));
  }, []);

  const startGame = useCallback((difficulty: Difficulty) => {
    clearSavedGame(); // нова гра починається з чистого стану
    setSession((current) => ({ ...current, difficulty, phase: 'game' }));
  }, []);

  const finishGame = useCallback(() => {
    clearSavedGame();
    goTo('result');
  }, [goTo]);

  const exitGame = useCallback(() => {
    clearSavedGame();
    goTo('start');
  }, [goTo]);

  const restartGame = useCallback(() => {
    goTo('start');
  }, [goTo]);

  const handleCaseGenerated = useCallback((detectiveCase: DetectiveCase) => {
    setSession((current) => ({ ...current, activeCase: { detectiveCase, isGenerated: true } }));
  }, []);

  const selectBuiltInCase = useCallback(() => {
    setSession((current) => ({ ...current, activeCase: BUILT_IN_CASE }));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <div className={styles.app}>
          <a className={styles.skipLink} href="#main">
            Перейти до основного вмісту
          </a>

          <header className={styles.header}>
            <p className={styles.logo}>AI Detective</p>
          </header>

          <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div key={phase} {...motionPresets.page}>
                <Suspense fallback={<PageFallback />}>
                  {renderPhase(session, {
                    startGame,
                    finishGame,
                    exitGame,
                    restartGame,
                    handleCaseGenerated,
                    selectBuiltInCase,
                  })}
                </Suspense>
              </m.div>
            </AnimatePresence>
          </main>

          <footer className={styles.footer}>
            <small>Deduction Game · AI керує NPC, код керує правилами</small>
          </footer>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}

function PageFallback() {
  return (
    <div role="status" className={styles.fallback}>
      <Spinner /> Завантаження…
    </div>
  );
}

interface PhaseHandlers {
  readonly startGame: (difficulty: Difficulty) => void;
  readonly finishGame: () => void;
  readonly exitGame: () => void;
  readonly restartGame: () => void;
  readonly handleCaseGenerated: (detectiveCase: DetectiveCase) => void;
  readonly selectBuiltInCase: () => void;
}

function renderPhase({ phase, difficulty, activeCase }: Session, handlers: PhaseHandlers) {
  switch (phase) {
    case 'start':
      return (
        <StartPage
          detectiveCase={activeCase.detectiveCase}
          isGenerated={activeCase.isGenerated}
          onStart={handlers.startGame}
          onCaseGenerated={handlers.handleCaseGenerated}
          onSelectBuiltInCase={handlers.selectBuiltInCase}
        />
      );
    case 'game':
      return (
        <GamePage
          detectiveCase={activeCase.detectiveCase}
          difficulty={difficulty}
          onFinish={handlers.finishGame}
          onExit={handlers.exitGame}
        />
      );
    case 'result':
      return <ResultPage onRestart={handlers.restartGame} />;
    default:
      return assertNever(phase);
  }
}