import { describe, expect, it } from 'vitest';
import { emptyGame } from './helpers';
import { finishHop, lane, placeFrog, still } from './gameplay.helpers';

/** Places the frog on the river row under a log and hops it up to the home row. */
function hopIntoHome(game: ReturnType<typeof emptyGame>, col: number): void {
  const log = still('log', col - 2, 5);
  lane(game, 1).objects.push(log);
  placeFrog(game, 1, col, log);
  game.step(['up']);
  finishHop(game);
}

describe('home bays (FR-12, FR-15, FR-22)', () => {
  it('landing on a wall (even column) kills the frog', () => {
    const game = emptyGame();
    hopIntoHome(game, 6);
    expect(game.deathCause).toBe('wall');
    expect(game.bays.every((b) => !b.filled)).toBe(true);
  });

  it('an empty bay fills and the frog returns to the start without losing a life', () => {
    const game = emptyGame();
    hopIntoHome(game, 5);
    expect(game.bays[2].filled).toBe(true);
    expect(game.frog.row).toBe(12);
    expect(game.lives).toBe(3);
  });

  it('landing on a filled bay kills the frog', () => {
    const game = emptyGame();
    game.bays[2].filled = true;
    hopIntoHome(game, 5);
    expect(game.deathCause).toBe('bay');
  });

  it('filled bays stay filled after a death', () => {
    const game = emptyGame();
    hopIntoHome(game, 5);
    expect(game.bays[2].filled).toBe(true);
    game.lifeTimerMs = 1;
    game.step([]);
    for (let i = 0; i < 100 && game.deathTicks > 0; i++) game.step([]);
    expect(game.bays[2].filled).toBe(true);
  });

  it('filling all five bays clears the level', () => {
    const game = emptyGame();
    [0, 1, 3, 4].forEach((i) => (game.bays[i].filled = true));
    hopIntoHome(game, 5);
    expect(game.mode).toBe('levelClear');
  });
});
