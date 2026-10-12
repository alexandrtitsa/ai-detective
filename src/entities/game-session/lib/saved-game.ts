import type { DetectiveCase } from '@/entities/case';
import { appStorage } from '@/shared/lib';
import type { GameState } from '../model/types';
import { restoreGame, serializeGame } from './persistence';

const GAME_STORAGE_KEY = 'ai-detective:game:v1';

export function loadSavedGame(detectiveCase: DetectiveCase): GameState | undefined {
  return restoreGame(appStorage.read(GAME_STORAGE_KEY), detectiveCase);
}

export function saveGame(state: GameState): void {
  appStorage.write(GAME_STORAGE_KEY, serializeGame(state));
}

export function clearSavedGame(): void {
  appStorage.remove(GAME_STORAGE_KEY);
}
