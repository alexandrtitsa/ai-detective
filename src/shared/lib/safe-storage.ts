export type StorageBackend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface JsonStorage {
  read(key: string): unknown;
  write(key: string, value: unknown): boolean;
  remove(key: string): void;
}

export function createJsonStorage(getBackend: () => StorageBackend): JsonStorage {
  return {
    read(key) {
      try {
        const raw = getBackend().getItem(key);
        if (raw === null) return undefined;
        const parsed: unknown = JSON.parse(raw);
        return parsed;
      } catch {
        return undefined;
      }
    },
    write(key, value) {
      try {
        getBackend().setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        getBackend().removeItem(key);
      } catch {
        // сховище недоступне: видаляти нічого
      }
    },
  };
}
