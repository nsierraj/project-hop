import { describe, expect, it } from 'vitest';
import { createStore } from '../../src/storage/store';

describe('storage fallback (FR-042)', () => {
  it('returns null and does not throw when storage is blocked', () => {
    const store = createStore(() => {
      throw new Error('SecurityError');
    });
    expect(store.get('anything')).toBeNull();
    expect(() => store.set('anything', '1')).not.toThrow();
    expect(store.failed).toBe(true);
  });

  it('keeps values in memory after a write fails and marks the store as failed', () => {
    let fail = false;
    const data = new Map<string, string>();
    const backing = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (fail) throw new Error('QuotaExceededError');
        data.set(k, v);
      },
    } as unknown as Storage;
    const store = createStore(() => backing);

    store.set('k', 'a');
    expect(store.get('k')).toBe('a');
    expect(store.failed).toBe(false);

    fail = true;
    store.set('k', 'b');
    expect(store.get('k')).toBe('b');
    expect(store.failed).toBe(true);
  });
});
