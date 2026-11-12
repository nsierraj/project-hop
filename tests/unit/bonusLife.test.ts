import { describe, expect, it } from 'vitest';
import { config, emptyGame } from './helpers';
import { placeFrog } from './gameplay.helpers';
import { crossesBonusThreshold } from '../../src/core/scoring';

const cfg = config().game;

describe('bonus life (FR-20)', () => {
  it('detects the first crossing of the threshold only', () => {
    const threshold = cfg.bonusLife.scoreThreshold;
    expect(crossesBonusThreshold(cfg, threshold - 10, threshold)).toBe(true);
    expect(crossesBonusThreshold(cfg, threshold, threshold + 10)).toBe(false);
  });

  it('awards one extra life when the threshold is crossed, once', () => {
    const game = emptyGame();
    game.score = cfg.bonusLife.scoreThreshold - 5;
    placeFrog(game, 12, 6);
    game.step(['up']);
    for (let i = 0; i < 10; i++) game.step([]);
    expect(game.score).toBeGreaterThanOrEqual(cfg.bonusLife.scoreThreshold);
    expect(game.lives).toBe(cfg.lives.start + 1);
    expect(game.bonusLifeAwarded).toBe(true);
  });

  it('never goes above the five-life maximum', () => {
    const game = emptyGame();
    game.lives = cfg.lives.max;
    game.score = cfg.bonusLife.scoreThreshold - 5;
    placeFrog(game, 12, 6);
    game.step(['up']);
    for (let i = 0; i < 10; i++) game.step([]);
    expect(game.lives).toBe(cfg.lives.max);
  });
});
