/**
 * Safe wrapper around localStorage. Storage can be blocked or full (FR-042), so every access is
 * guarded. On the first failed write the store switches to memory for the rest of the session.
 */
export interface Store {
  get(key: string): string | null;
  set(key: string, value: string): void;
  /** True once storage has failed, so the game can tell the player scores will not be saved. */
  readonly failed: boolean;
}

export function createStore(
  backing: () => Storage | undefined = () => globalThis.localStorage,
): Store {
  const memory = new Map<string, string>();
  let failed = false;

  const readBacking = (key: string): string | null => {
    try {
      return backing()?.getItem(key) ?? null;
    } catch {
      failed = true;
      return null;
    }
  };

  const writeBacking = (key: string, value: string): boolean => {
    try {
      const storage = backing();
      if (!storage) return false;
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  return {
    get(key) {
      if (memory.has(key)) return memory.get(key) ?? null;
      return readBacking(key);
    },
    set(key, value) {
      memory.set(key, value);
      if (!failed && !writeBacking(key, value)) failed = true;
    },
    get failed() {
      return failed;
    },
  };
}
