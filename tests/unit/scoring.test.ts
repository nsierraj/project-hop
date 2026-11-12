import { describe, expect, it } from 'vitest';
import { config, emptyGame } from './helpers';
import { finishHop, placeFrog } from './gameplay.helpers';
import { bayPoints } from '../../src/core/scoring';

const cfg = config().game;

describe('scoring (AC-5, FR-25 to FR-28)', () => {
  it('awards 10 points for a forward hop to a new row only', () => {
    const game = emptyGame();
    game.step(['up']);
    finishHop(game);
    expect(game.score).toBe(cfg.points.forwardHop);

    game.step(['down']);
    finishHop(game);
    expect(game.score).toBe(cfg.points.forwardHop);

    game.step(['up']);
    finishHop(game);
    expect(game.score).toBe(cfg.points.forwardHop);
  });

  it('awards 50 points plus 10 per full second left when a bay is reached (FR-26, FR-27)', () => {
    expect(bayPoints(cfg, 10_500)).toBe(cfg.points.bayReached + 10 * cfg.points.timeBonusPerSecond);
    expect(bayPoints(cfg, 999)).toBe(cfg.points.bayReached);
  });

  it('awards the level-clear bonus when a level is cleared (FR-28)', () => {
    const game = emptyGame();
    [0, 1, 3].forEach((i) => (game.bays[i].filled = true));
    game.bays[4].filled = true;
    game.bays[2].filled = false;
    placeFrog(game, 1, 5, { kind: 'log', x: 3, length: 5, vel: 0, dive: null });
    game.step(['up']);
    finishHop(game);
    expect(game.mode).toBe('levelClear');
    expect(game.score).toBeGreaterThanOrEqual(cfg.points.levelCleared);
  });
});
