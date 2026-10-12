import { useCallback, type Dispatch } from 'react';
import {
  selectAskCheck,
  selectWasAsked,
  type GameAction,
  type GameState,
} from '@/entities/game-session';

interface Params {
  readonly state: GameState;
  readonly dispatch: Dispatch<GameAction>;
}

export function usePlayerActions({ state, dispatch }: Params) {
  const askNpc = useCallback(
    (npcId: string, topicId: string) => {
      dispatch({ type: 'question_asked', entryId: crypto.randomUUID(), npcId, topicId });
    },
    [dispatch],
  );

  const accuse = useCallback(
    (suspectId: string) => dispatch({ type: 'accused', suspectId }),
    [dispatch],
  );

  const restart = useCallback(() => dispatch({ type: 'restarted' }), [dispatch]);

  const checkAsk = useCallback(
    (npcId: string, topicId: string) => selectAskCheck(state, npcId, topicId),
    [state],
  );

  const wasAsked = useCallback(
    (npcId: string, topicId: string) => selectWasAsked(state, npcId, topicId),
    [state],
  );

  return { askNpc, accuse, restart, checkAsk, wasAsked } as const;
}
