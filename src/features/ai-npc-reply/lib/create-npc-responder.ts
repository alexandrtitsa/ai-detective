import type { NpcResponder } from '../model/types';
import { createAiNpcResponder } from './ai-npc-responder';
import { createMockNpcResponder } from './mock-npc-responder';

export function createNpcResponder(mode = import.meta.env.VITE_NPC_MODE ?? 'ai'): NpcResponder {
  return mode === 'mock' ? createMockNpcResponder() : createAiNpcResponder();
}
