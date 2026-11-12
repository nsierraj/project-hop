import type { GameConfig } from '../config/loader';

/** Points for a frog reaching a bay: the bay value plus a time bonus per full second left (FR-26, FR-27). */
export function bayPoints(cfg: GameConfig, timerMs: number): number {
  const fullSecondsLeft = Math.floor(timerMs / 1000);
  return cfg.points.bayReached + fullSecondsLeft * cfg.points.timeBonusPerSecond;
}

/** Whether a score crosses the bonus-life threshold for the first time (FR-20). */
export function crossesBonusThreshold(
  cfg: GameConfig,
  scoreBefore: number,
  scoreAfter: number,
): boolean {
  const threshold = cfg.bonusLife.scoreThreshold;
  return scoreBefore < threshold && scoreAfter >= threshold;
}
