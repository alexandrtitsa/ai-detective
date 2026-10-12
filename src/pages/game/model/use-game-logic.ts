import type { DetectiveCase } from '@/entities/case';
import { selectDiscoveredClues, useGameState, type GameRules } from '@/entities/game-session';
import { useAIActions, type NpcResponder } from '@/features/ai-npc-reply';
import { usePlayerActions } from '@/features/ask-npc';

export function useGameLogic(
  detectiveCase: DetectiveCase,
  responder: NpcResponder,
  rules: GameRules,
) {
  const { state, dispatch } = useGameState(detectiveCase, rules);
  const player = usePlayerActions({ state, dispatch });
  const ai = useAIActions({ state, dispatch, responder });

  return {
    state,
    discoveredClues: selectDiscoveredClues(state),
    isNpcThinking: ai.isThinking,
    checkAsk: player.checkAsk,
    wasAsked: player.wasAsked,
    askNpc: player.askNpc,
    accuse: player.accuse,
    restart: player.restart,
  } as const;
}
