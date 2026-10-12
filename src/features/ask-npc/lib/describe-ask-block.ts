import type { AskBlockReason } from '@/entities/game-session';

const HINTS: Record<AskBlockReason, string | null> = {
  game_over: 'Розслідування завершено.',
  pending: null,
  no_questions: 'Питання закінчились: час звинувачувати.',
  repeat_forbidden: 'Це питання вже ставили, а на цій складності повторювати їх не можна.',
  repeat_needs_evidence: 'Це питання вже ставили. Повторити можна, коли зʼявляться нові докази.',
};

export function describeAskBlock(reason: AskBlockReason): string | null {
  return HINTS[reason];
}
