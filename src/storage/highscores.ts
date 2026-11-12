import type { Store } from './store';

export const HIGH_SCORES_KEY = 'hop.highScores.v1';

export interface ScoreEntry {
  initials: string;
  score: number;
  levelReached: number;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  assisted: boolean;
}

const INITIALS_PATTERN = /^[A-Z]{3}$/;

function isEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.initials === 'string' &&
    INITIALS_PATTERN.test(entry.initials) &&
    typeof entry.score === 'number' &&
    entry.score >= 0 &&
    typeof entry.levelReached === 'number' &&
    entry.levelReached >= 1 &&
    typeof entry.date === 'string' &&
    typeof entry.assisted === 'boolean'
  );
}

/** Reads the table. Malformed data is dropped rather than thrown (contracts/storage.md). */
export function loadHighScores(store: Store, maxEntries: number): ScoreEntry[] {
  const raw = store.get(HIGH_SCORES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortEntries(parsed.filter(isEntry)).slice(0, maxEntries);
  } catch {
    return [];
  }
}

/** A score qualifies if it is above zero and either the table has room or it beats the lowest entry. */
export function qualifies(entries: ScoreEntry[], score: number, maxEntries: number): boolean {
  if (score <= 0) return false;
  if (entries.length < maxEntries) return true;
  const lowest = Math.min(...entries.map((entry) => entry.score));
  return score > lowest;
}

/** Returns a new table with the entry added, sorted by score, and trimmed to maxEntries. */
export function insertScore(entries: ScoreEntry[], entry: ScoreEntry, maxEntries: number): ScoreEntry[] {
  return sortEntries([...entries, entry]).slice(0, maxEntries);
}

export function saveHighScores(store: Store, entries: ScoreEntry[]): void {
  store.set(HIGH_SCORES_KEY, JSON.stringify(entries));
}

/** Highest score first. Ties keep the earlier entry first. */
function sortEntries(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => b.score - a.score);
}
