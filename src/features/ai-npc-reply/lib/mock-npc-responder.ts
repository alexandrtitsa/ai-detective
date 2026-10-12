import { delay } from '@/shared/lib';
import type { NpcResponder } from '../model/types';
import { prepareDecision } from './prepare-decision';
import { resolveNpcAnswer } from './resolve-npc-answer';

export function createMockNpcResponder(latencyMs = 400): NpcResponder {
  return {
    async answer(query, signal) {
      await delay(latencyMs, signal);
      return resolveNpcAnswer(prepareDecision(query));
    },
  };
}
