import type { Store } from './store';

export const SETTINGS_KEY = 'hop.settings.v1';

export interface Settings {
  musicVolume: number;
  effectsVolume: number;
  muted: boolean;
  speedAssist: boolean;
  haptics: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.7,
  effectsVolume: 0.8,
  muted: false,
  speedAssist: false,
  haptics: true,
};

const volume = (value: unknown, fallback: number): number =>
  typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback;

/** Missing or invalid keys take their defaults. Unknown keys are dropped on the next write. */
export function loadSettings(store: Store): Settings {
  const raw = store.get(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      musicVolume: volume(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume),
      effectsVolume: volume(parsed.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_SETTINGS.muted,
      speedAssist:
        typeof parsed.speedAssist === 'boolean' ? parsed.speedAssist : DEFAULT_SETTINGS.speedAssist,
      haptics: typeof parsed.haptics === 'boolean' ? parsed.haptics : DEFAULT_SETTINGS.haptics,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(store: Store, settings: Settings): void {
  store.set(SETTINGS_KEY, JSON.stringify(settings));
}
