import { describe, expect, it } from 'vitest';
import { createJsonStorage, type StorageBackend } from './safe-storage';

function memoryBackend(): StorageBackend {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
}

const brokenBackend: StorageBackend = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('quota');
  },
  removeItem: () => {
    throw new Error('denied');
  },
};

describe('createJsonStorage', () => {
  it('зберігає й читає JSON', () => {
    const storage = createJsonStorage(() => memoryBackend());
    const backend = memoryBackend();
    const shared = createJsonStorage(() => backend);

    expect(storage.read('missing')).toBeUndefined();
    expect(shared.write('k', { a: [1, 2] })).toBe(true);
    expect(shared.read('k')).toEqual({ a: [1, 2] });
  });

  it('повертає undefined для пошкодженого JSON', () => {
    const backend = memoryBackend();
    backend.setItem('k', '{broken');

    expect(createJsonStorage(() => backend).read('k')).toBeUndefined();
  });

  it('видаляє запис', () => {
    const storage = createJsonStorage(() => memoryBackend());
    storage.write('k', 1);
    storage.remove('k');

    expect(storage.read('k')).toBeUndefined();
  });

  it('не кидає помилок, коли сховище недоступне', () => {
    const storage = createJsonStorage(() => brokenBackend);

    expect(storage.read('k')).toBeUndefined();
    expect(storage.write('k', 1)).toBe(false);
    expect(() => {
      storage.remove('k');
    }).not.toThrow();
  });
});
