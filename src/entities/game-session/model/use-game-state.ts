import { useEffect, useReducer } from 'react';
import type { DetectiveCase } from '@/entities/case';
import { loadSavedGame, saveGame } from '../lib/saved-game';
import { createInitialState, gameReducer } from './reducer';
import type { GameRules } from './rules';

export function useGameState(detectiveCase: DetectiveCase, rules: GameRules) {
  const [state, dispatch] = useReducer(
    gameReducer,
    { detectiveCase, rules },
    (init) =>
      loadSavedGame(init.detectiveCase) ?? createInitialState(init.detectiveCase, init.rules),
  );

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return { state, dispatch } as const;
}
