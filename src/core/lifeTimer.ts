import type { GameConfig } from '../config/loader';

/** Full duration of one life. Speed assist gives more time (FR-50). */
export function lifeDurationMs(cfg: GameConfig, assisted: boolean): number {
  const seconds = assisted ? cfg.speedAssist.lifeTimerSeconds : cfg.lifeTimerSeconds;
  return seconds * 1000;
}

/** The timer bar changes in the last few seconds (FR-21). */
export function isWarning(timerMs: number, cfg: GameConfig): boolean {
  return timerMs <= cfg.warningSeconds * 1000;
}
