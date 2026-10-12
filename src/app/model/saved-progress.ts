import { clearSavedGame } from '@/entities/game-session';
import { appStorage } from '@/shared/lib';
import {
  INITIAL_SESSION,
  restoreSession,
  serializeSession,
  SESSION_KEY,
  type Session,
} from './session';

export function loadInitialSession(): Session {
  return restoreSession(appStorage.read(SESSION_KEY)) ?? INITIAL_SESSION;
}

export function saveSession(session: Session): void {
  appStorage.write(SESSION_KEY, serializeSession(session));
}

/** Повне скидання: потрібне, коли збережений стан зациклює збій інтерфейсу. */
export function clearSavedProgress(): void {
  appStorage.remove(SESSION_KEY);
  clearSavedGame();
}
