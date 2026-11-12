import { describe, expect, it } from 'vitest';
import { emptyGame } from './helpers';
import { lane, placeFrog, still } from './gameplay.helpers';
import { overlapsVehicle } from '../../src/core/collision';

describe('road collisions (AC-2, FR-9, FR-13, FR-14)', () => {
  it('a vehicle touching the frog costs exactly one life and sends it back to the bank', () => {
    const game = emptyGame();
    lane(game, 11).objects.push(still('vehicle', 6, 1));
    game.step(['up']);
    expect(game.deathCause).toBe('vehicle');
    expect(game.lives).toBe(2);
    for (let i = 0; i < 200 && game.mode === 'playing' && game.deathTicks > 0; i++) game.step([]);
    expect(game.frog.row).toBe(12);
    expect(game.frog.col).toBe(6);
    expect(game.lives).toBe(2);
  });

  it('running out of time costs one life (FR-13)', () => {
    const game = emptyGame();
    game.lifeTimerMs = 1;
    game.step([]);
    expect(game.deathCause).toBe('timer');
    expect(game.lives).toBe(2);
  });

  it('uses hitboxes smaller than the sprites, so a near miss is safe (FR-14)', () => {
    const frog = { col: 6, row: 11, hopTicks: 0, buffered: null, riding: null, maxRowReached: 12 };
    expect(overlapsVehicle(frog, still('vehicle', 6.5, 1))).toBe(true);
    expect(overlapsVehicle(frog, still('vehicle', 6.95, 1))).toBe(false);
    expect(overlapsVehicle(frog, still('vehicle', 4.0, 2))).toBe(false);
  });

  it('a vehicle in another lane does not hit the frog', () => {
    const game = emptyGame();
    placeFrog(game, 11, 6);
    lane(game, 10).objects.push(still('vehicle', 6, 1));
    game.step([]);
    expect(game.deathCause).toBeNull();
  });
});
