import { describe, expect, it } from 'vitest';
import { createStore } from '../../src/storage/store';
import {
  HIGH_SCORES_KEY,
  insertScore,
  loadHighScores,
  qualifies,
  saveHighScores,
  type ScoreEntry,
} from '../../src/storage/highscores';

const entry = (score: number, initials = 'AAA'): ScoreEntry => ({
  initials,
  score,
  levelReached: 1,
  date: '2026-11-12',
  assisted: false,
});

function memoryStore() {
  const data = new Map<string, string>();
  return createStore(
    () =>
      ({
        getItem: (k: string) => data.get(k) ?? null,
        setItem: (k: string, v: string) => data.set(k, v),
      }) as unknown as Storage,
  );
}

describe('high scores (FR-024, FR-039, FR-040)', () => {
  it('keeps at most ten entries sorted by score', () => {
    let table: ScoreEntry[] = [];
    for (let s = 1; s <= 12; s++) table = insertScore(table, entry(s * 100), 10);
    expect(table).toHaveLength(10);
    expect(table[0].score).toBe(1200);
    expect(table[9].score).toBe(300);
  });

  it('qualifies only when the table has room or the score beats the lowest entry', () => {
    const full = Array.from({ length: 10 }, (_, i) => entry((i + 1) * 100));
    expect(qualifies([], 50, 10)).toBe(true);
    expect(qualifies([], 0, 10)).toBe(false);
    expect(qualifies(full, 100, 10)).toBe(false);
    expect(qualifies(full, 101, 10)).toBe(true);
  });

  it('round-trips through storage and keeps the assist flag', () => {
    const store = memoryStore();
    const table = insertScore([], { ...entry(500, 'ABC'), assisted: true }, 10);
    saveHighScores(store, table);
    const loaded = loadHighScores(store, 10);
    expect(loaded).toEqual(table);
    expect(loaded[0].assisted).toBe(true);
  });

  it('drops malformed entries and invalid initials instead of throwing', () => {
    const store = memoryStore();
    store.set(
      HIGH_SCORES_KEY,
      JSON.stringify([entry(100, 'ABC'), { ...entry(200), initials: 'ab1' }, 'nope']),
    );
    expect(loadHighScores(store, 10).map((e) => e.initials)).toEqual(['ABC']);
  });
});
