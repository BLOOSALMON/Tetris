import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HIGH_SCORE_STORAGE_KEY } from '../config/game';
import { loadHighScore, saveHighScore } from './high-score';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe('high-score', () => {
  const original = globalThis.localStorage;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: original,
      configurable: true,
    });
  });

  it('저장된 값이 없으면 0을 반환한다', () => {
    expect(loadHighScore()).toBe(0);
  });

  it('저장한 최고 점수를 다시 불러올 수 있다', () => {
    saveHighScore(12345);
    expect(loadHighScore()).toBe(12345);
    expect(localStorage.getItem(HIGH_SCORE_STORAGE_KEY)).toBe('12345');
  });
});
