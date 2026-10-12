import { createJsonStorage } from './safe-storage';

export const appStorage = createJsonStorage(() => window.localStorage);
