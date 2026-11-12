import { describe, expect, it } from 'vitest';
import { emptyGame } from './helpers';
import { lane, placeFrog, still } from './gameplay.helpers';

describe('river (FR-8, FR-10, FR-11)', () => {
  it('landing on open water kills the frog', () => {
    const game = emptyGame();
    placeFrog(game, 1, 6);
    game.step([]);
    expect(game.deathCause).toBe('water');
    expect(game.lives).toBe(2);
  });

  it('a frog on a log moves with the log', () => {
    const game = emptyGame();
    const log = { ...still('log', 5, 3), vel: 1 };
    lane(game, 1).objects.push(log);
    placeFrog(game, 1, 6);
    for (let i = 0; i < 60; i++) game.step([]);
    expect(game.deathCause).toBeNull();
    expect(game.frog.col).toBeGreaterThan(6.9);
    expect(game.frog.col).toBeLessThan(7.1);
  });

  it('being carried past the edge kills the frog (FR-11)', () => {
    const game = emptyGame();
    const log = { ...still('log', 11, 2), vel: 1 };
    lane(game, 1).objects.push(log);
    placeFrog(game, 1, 12.9, log);
    game.step([]);
    expect(game.deathCause).toBe('edge');
  });

  it('lateral hops work while riding (FR-8)', () => {
    const game = emptyGame();
    const log = still('log', 4, 5);
    lane(game, 1).objects.push(log);
    placeFrog(game, 1, 6, log);
    game.step(['right']);
    for (let i = 0; i < 20; i++) game.step([]);
    expect(game.deathCause).toBeNull();
    expect(game.frog.col).toBe(7);
  });
});
