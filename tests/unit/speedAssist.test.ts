import { describe, expect, it } from 'vitest';
import { config, emptyGame } from './helpers';
import { Game } from '../../src/core/game';
import { lifeDurationMs } from '../../src/core/lifeTimer';

const cfg = config().game;

describe('speed assist (FR-050)', () => {
  it('slows every lane object to the configured factor of normal speed', () => {
    const normal = new Game(config(), 9);
    normal.start(false);
    const assisted = new Game(config(), 9);
    assisted.start(true);
    const pairs = normal.lanes.flatMap((lane, i) =>
      lane.objects.map((obj, j) => [obj.vel, assisted.lanes[i].objects[j].vel] as const),
    );
    expect(pairs.length).toBeGreaterThan(0);
    for (const [normalVel, assistedVel] of pairs) {
      expect(assistedVel / normalVel).toBeCloseTo(cfg.speedAssist.laneSpeedFactor, 10);
    }
  });

  it('gives a longer life timer when assisted (45 s vs 30 s)', () => {
    expect(lifeDurationMs(cfg, true)).toBe(cfg.speedAssist.lifeTimerSeconds * 1000);
    expect(lifeDurationMs(cfg, false)).toBe(cfg.lifeTimerSeconds * 1000);
    const assisted = emptyGame(3, true);
    expect(assisted.lifeTimerMs).toBe(cfg.speedAssist.lifeTimerSeconds * 1000);
  });

  it('does not change point values', () => {
    expect(cfg.points.forwardHop).toBe(10);
    expect(cfg.points.bayReached).toBe(50);
  });
});
