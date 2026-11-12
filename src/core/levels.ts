import type { LevelsConfig } from '../config/loader';

export interface LevelParams {
  /** The level used for every curve, capped so difficulty stops rising (AC-4). */
  effectiveLevel: number;
  speedMultiplier: number;
  objectsPerLane: number;
  divingShare: number;
  logMinLength: number;
  logMaxLength: number;
}

export function levelParams(level: number, cfg: LevelsConfig): LevelParams {
  const effectiveLevel = Math.min(level, cfg.capLevel);
  const steps = effectiveLevel - 1;
  const capSteps = Math.max(cfg.capLevel - 1, 1);
  const progress = steps / capSteps;

  const logMaxLength = Math.max(
    cfg.logLengthMinTiles,
    Math.round(cfg.logLengthStartTiles - (cfg.logLengthStartTiles - cfg.logLengthMinTiles) * progress),
  );

  return {
    effectiveLevel,
    speedMultiplier: 1 + cfg.speedIncreasePerLevel * steps,
    objectsPerLane: Math.max(1, Math.round(cfg.baseObjectsPerLane * (1 + cfg.densityIncreasePerLevel * steps))),
    divingShare: Math.min(1, cfg.divingShareStart + cfg.divingShareIncreasePerLevel * steps),
    logMinLength: cfg.logLengthMinTiles,
    logMaxLength,
  };
}
