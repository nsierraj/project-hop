import { describe, expect, it } from 'vitest';
import { config } from './helpers';
import { levelParams } from '../../src/core/levels';

const cfg = config().levels;

describe('level progression (AC-4, FR-23)', () => {
  it('starts at the base values on level 1', () => {
    const p = levelParams(1, cfg);
    expect(p.speedMultiplier).toBe(1);
    expect(p.objectsPerLane).toBe(cfg.baseObjectsPerLane);
    expect(p.divingShare).toBe(cfg.divingShareStart);
    expect(p.logMaxLength).toBe(cfg.logLengthStartTiles);
  });

  it('gets faster, denser, and shorter-log each level up to the cap', () => {
    const one = levelParams(1, cfg);
    const five = levelParams(5, cfg);
    expect(five.speedMultiplier).toBeGreaterThan(one.speedMultiplier);
    expect(five.divingShare).toBeGreaterThan(one.divingShare);
    expect(five.logMaxLength).toBeLessThanOrEqual(one.logMaxLength);
  });

  it('stops changing after the cap level', () => {
    expect(levelParams(cfg.capLevel + 1, cfg)).toEqual(levelParams(cfg.capLevel, cfg));
    expect(levelParams(40, cfg)).toEqual(levelParams(cfg.capLevel, cfg));
  });
});
