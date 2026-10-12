import { rephraseStatement } from '../api/rephrase-statement';
import type { NpcResponder } from '../model/types';
import { buildRephraseRequest } from './build-rephrase-request';
import { prepareDecision } from './prepare-decision';
import { resolveNpcAnswer } from './resolve-npc-answer';

export function createAiNpcResponder(): NpcResponder {
  return {
    async answer(query, signal) {
      // Контекст обмежено, а правду/брехню й доказ вирішує код: модель лише озвучує готову репліку
      const input = prepareDecision(query);
      const decided = resolveNpcAnswer(input);
      const statement = await rephraseStatement(buildRephraseRequest(input, decided), signal);

      return { ...decided, statement };
    },
  };
}
