import { describe, expect, it } from 'vitest';
import { loadConfig, validateGame, validateLayout, validateLevels } from '../../src/config/loader';
import gameJson from '../../src/config/game.json';
import layoutJson from '../../src/config/layout.json';
import levelsJson from '../../src/config/levels.json';

describe('config loader', () => {
  it('loads the shipped configuration', () => {
    const config = loadConfig();
    expect(config.layout.rows).toHaveLength(13);
    expect(config.levels.capLevel).toBe(12);
  });

  it('names the file and key when a value is out of range', () => {
    const bad = { ...gameJson, lives: { start: 3, max: 99 } };
    expect(() => validateGame(bad)).toThrow(/game\.json.*lives\.max|"max"/);
  });

  it('rejects a sinking warning shorter than the 750 ms minimum (FR-18)', () => {
    const bad = { ...gameJson, dive: { ...gameJson.dive, sinkingMs: 500 } };
    expect(() => validateGame(bad)).toThrow(/sinkingMs/);
  });

  it('rejects a layout whose rows are out of order (FR-2)', () => {
    const rows = [...layoutJson.rows];
    [rows[1], rows[6]] = [rows[6], rows[1]];
    expect(() => validateLayout({ ...layoutJson, rows })).toThrow(/rows/);
  });

  it('rejects a log minimum longer than the start length', () => {
    expect(() => validateLevels({ ...levelsJson, logLengthMinTiles: 9 })).toThrow(/logLengthMinTiles/);
  });
});
