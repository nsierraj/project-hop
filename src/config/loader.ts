import gameJson from './game.json';
import levelsJson from './levels.json';
import layoutJson from './layout.json';

export interface GameConfig {
  lives: { start: number; max: number };
  bonusLife: { scoreThreshold: number };
  lifeTimerSeconds: number;
  warningSeconds: number;
  points: { forwardHop: number; bayReached: number; timeBonusPerSecond: number; levelCleared: number };
  hop: { durationMs: number; bufferSize: number };
  swipe: { minDistanceCssPx: number; maxDurationMs: number };
  dive: { surfacedMs: number; sinkingMs: number; submergedMs: number; risingMs: number };
  divingSinkWarningMs: number;
  speedAssist: { laneSpeedFactor: number; lifeTimerSeconds: number };
  highScores: { maxEntries: number; initialsLength: number };
  levelClearCelebrationMs: number;
  deathAnimationMs: number;
}

export interface LevelsConfig {
  capLevel: number;
  baseObjectsPerLane: number;
  laneSpeedTilesPerSecond: { river: number; road: number };
  speedIncreasePerLevel: number;
  densityIncreasePerLevel: number;
  divingShareStart: number;
  divingShareIncreasePerLevel: number;
  logLengthStartTiles: number;
  logLengthMinTiles: number;
}

export type RowKind = 'home' | 'river' | 'median' | 'road' | 'bank';

export interface LayoutRow {
  name: string;
  kind: RowKind;
  direction?: 'left' | 'right';
  spawn?: 'log' | 'turtle' | 'vehicle';
}

export interface LayoutConfig {
  grid: { columns: number; rows: number };
  rows: LayoutRow[];
}

export interface Config {
  game: GameConfig;
  levels: LevelsConfig;
  layout: LayoutConfig;
}

class ConfigError extends Error {
  constructor(file: string, key: string, problem: string) {
    super(`Invalid config ${file}: "${key}" ${problem}`);
    this.name = 'ConfigError';
  }
}

type Check = { min?: number; max?: number; integer?: boolean };

function num(file: string, obj: Record<string, unknown>, key: string, check: Check = {}): number {
  const value = obj[key];
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ConfigError(file, key, 'must be a number');
  }
  if (check.integer && !Number.isInteger(value)) {
    throw new ConfigError(file, key, 'must be an integer');
  }
  if (check.min !== undefined && value < check.min) {
    throw new ConfigError(file, key, `must be at least ${check.min}`);
  }
  if (check.max !== undefined && value > check.max) {
    throw new ConfigError(file, key, `must be at most ${check.max}`);
  }
  return value;
}

function obj(file: string, parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = parent[key];
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ConfigError(file, key, 'must be an object');
  }
  return value as Record<string, unknown>;
}

export function validateGame(raw: unknown): GameConfig {
  const file = 'game.json';
  const root = raw as Record<string, unknown>;
  const lives = obj(file, root, 'lives');
  const bonus = obj(file, root, 'bonusLife');
  const points = obj(file, root, 'points');
  const hop = obj(file, root, 'hop');
  const swipe = obj(file, root, 'swipe');
  const dive = obj(file, root, 'dive');
  const assist = obj(file, root, 'speedAssist');
  const scores = obj(file, root, 'highScores');

  const config: GameConfig = {
    lives: {
      start: num(file, lives, 'start', { min: 1, integer: true }),
      max: num(file, lives, 'max', { min: 1, max: 9, integer: true }),
    },
    bonusLife: { scoreThreshold: num(file, bonus, 'scoreThreshold', { min: 0 }) },
    lifeTimerSeconds: num(file, root, 'lifeTimerSeconds', { min: 1 }),
    warningSeconds: num(file, root, 'warningSeconds', { min: 0.1 }),
    points: {
      forwardHop: num(file, points, 'forwardHop', { min: 0, integer: true }),
      bayReached: num(file, points, 'bayReached', { min: 0, integer: true }),
      timeBonusPerSecond: num(file, points, 'timeBonusPerSecond', { min: 0, integer: true }),
      levelCleared: num(file, points, 'levelCleared', { min: 0, integer: true }),
    },
    hop: {
      durationMs: num(file, hop, 'durationMs', { min: 60, max: 200 }),
      bufferSize: num(file, hop, 'bufferSize', { min: 1, max: 1, integer: true }),
    },
    swipe: {
      minDistanceCssPx: num(file, swipe, 'minDistanceCssPx', { min: 16, max: 40 }),
      maxDurationMs: num(file, swipe, 'maxDurationMs', { min: 1 }),
    },
    dive: {
      surfacedMs: num(file, dive, 'surfacedMs', { min: 1 }),
      sinkingMs: num(file, dive, 'sinkingMs', { min: 1 }),
      submergedMs: num(file, dive, 'submergedMs', { min: 1 }),
      risingMs: num(file, dive, 'risingMs', { min: 1 }),
    },
    divingSinkWarningMs: num(file, root, 'divingSinkWarningMs', { min: 750 }),
    speedAssist: {
      laneSpeedFactor: num(file, assist, 'laneSpeedFactor', { min: 0.5, max: 1 }),
      lifeTimerSeconds: num(file, assist, 'lifeTimerSeconds', { min: 1 }),
    },
    highScores: {
      maxEntries: num(file, scores, 'maxEntries', { min: 10, max: 10, integer: true }),
      initialsLength: num(file, scores, 'initialsLength', { min: 3, max: 3, integer: true }),
    },
    levelClearCelebrationMs: num(file, root, 'levelClearCelebrationMs', { min: 0 }),
    deathAnimationMs: num(file, root, 'deathAnimationMs', { min: 0 }),
  };

  if (config.lives.start > config.lives.max) {
    throw new ConfigError(file, 'lives.start', 'must not exceed lives.max');
  }
  if (config.lifeTimerSeconds <= config.warningSeconds) {
    throw new ConfigError(file, 'lifeTimerSeconds', 'must be greater than warningSeconds');
  }
  if (config.speedAssist.lifeTimerSeconds < config.lifeTimerSeconds) {
    throw new ConfigError(file, 'speedAssist.lifeTimerSeconds', 'must not be below lifeTimerSeconds');
  }
  if (config.dive.sinkingMs < config.divingSinkWarningMs) {
    throw new ConfigError(file, 'dive.sinkingMs', 'must be at least divingSinkWarningMs');
  }
  return config;
}

export function validateLevels(raw: unknown): LevelsConfig {
  const file = 'levels.json';
  const root = raw as Record<string, unknown>;
  const speeds = obj(file, root, 'laneSpeedTilesPerSecond');
  const config: LevelsConfig = {
    capLevel: num(file, root, 'capLevel', { min: 1, integer: true }),
    baseObjectsPerLane: num(file, root, 'baseObjectsPerLane', { min: 1, integer: true }),
    laneSpeedTilesPerSecond: {
      river: num(file, speeds, 'river', { min: 0.1 }),
      road: num(file, speeds, 'road', { min: 0.1 }),
    },
    speedIncreasePerLevel: num(file, root, 'speedIncreasePerLevel', { min: 0 }),
    densityIncreasePerLevel: num(file, root, 'densityIncreasePerLevel', { min: 0 }),
    divingShareStart: num(file, root, 'divingShareStart', { min: 0, max: 1 }),
    divingShareIncreasePerLevel: num(file, root, 'divingShareIncreasePerLevel', { min: 0, max: 1 }),
    logLengthStartTiles: num(file, root, 'logLengthStartTiles', { min: 1, integer: true }),
    logLengthMinTiles: num(file, root, 'logLengthMinTiles', { min: 1, integer: true }),
  };
  if (config.logLengthMinTiles > config.logLengthStartTiles) {
    throw new ConfigError(file, 'logLengthMinTiles', 'must not exceed logLengthStartTiles');
  }
  return config;
}

const ROW_KINDS: RowKind[] = ['home', 'river', 'median', 'road', 'bank'];

export function validateLayout(raw: unknown): LayoutConfig {
  const file = 'layout.json';
  const root = raw as Record<string, unknown>;
  const grid = obj(file, root, 'grid');
  const columns = num(file, grid, 'columns', { min: 13, max: 13, integer: true });
  const rowCount = num(file, grid, 'rows', { min: 13, max: 13, integer: true });
  const rows = root.rows as LayoutRow[];
  if (!Array.isArray(rows) || rows.length !== rowCount) {
    throw new ConfigError(file, 'rows', `must list exactly ${rowCount} rows`);
  }
  const kinds = rows.map((row) => row.kind);
  const expected: RowKind[] = [
    'home',
    'river', 'river', 'river', 'river', 'river',
    'median',
    'road', 'road', 'road', 'road', 'road',
    'bank',
  ];
  if (kinds.some((kind, i) => kind !== expected[i])) {
    throw new ConfigError(file, 'rows', 'must follow the order home, 5 river, median, 5 road, bank');
  }
  for (const row of rows) {
    if (!ROW_KINDS.includes(row.kind)) {
      throw new ConfigError(file, 'rows.kind', `unknown kind "${row.kind}"`);
    }
    if ((row.kind === 'river' || row.kind === 'road') && !row.direction) {
      throw new ConfigError(file, `rows.${row.name}.direction`, 'is required for lanes');
    }
  }
  return { grid: { columns, rows: rowCount }, rows };
}

export function loadConfig(): Config {
  return {
    game: validateGame(gameJson),
    levels: validateLevels(levelsJson),
    layout: validateLayout(layoutJson),
  };
}
