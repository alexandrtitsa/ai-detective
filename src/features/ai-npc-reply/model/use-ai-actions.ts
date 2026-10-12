import { useEffect, type Dispatch } from 'react';
import { selectPendingEntry, type GameAction, type GameState } from '@/entities/game-session';
import { describeNpcError } from '../lib/describe-npc-error';
import type { NpcResponder } from './types';

interface Params {
  readonly state: GameState;
  readonly dispatch: Dispatch<GameAction>;
  readonly responder: NpcResponder;
}

export function useAIActions({ state, dispatch, responder }: Params) {
  const pending = selectPendingEntry(state);
  const { detectiveCase, discoveredClueIds } = state;
  const { liePolicy } = state.rules;

  useEffect(() => {
    if (pending === undefined) return;

    const controller = new AbortController();
    const query = {
      detectiveCase,
      npcId: pending.npcId,
      topicId: pending.topicId,
      discoveredClueIds,
      liePolicy,
    };

    responder
      .answer(query, controller.signal)
      .then((answer) => {
        if (!controller.signal.aborted) {
          dispatch({ type: 'answer_received', entryId: pending.id, answer });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'question_failed',
            entryId: pending.id,
            message: describeNpcError(error),
          });
        }
      });

    return () => controller.abort();
  }, [pending, detectiveCase, discoveredClueIds, liePolicy, responder, dispatch]);

  return { isThinking: pending !== undefined } as const;
}
