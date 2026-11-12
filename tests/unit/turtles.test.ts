import { describe, expect, it } from 'vitest';
import { config, emptyGame } from './helpers';
import { lane, placeFrog } from './gameplay.helpers';
import { advanceDive, type Dive } from '../../src/core/turtles';

const timings = config().game.dive;

describe('diving turtles (AC-3, FR-16 to FR-18)', () => {
  it('cycles surfaced, sinking, submerged, rising, and back to surfaced', () => {
    const dive: Dive = { state: 'surfaced', timerMs: timings.surfacedMs };
    const seen: string[] = [dive.state];
    for (let t = 0; t < 4 * 3600; t++) {
      advanceDive(dive, 1, timings);
      if (seen[seen.length - 1] !== dive.state) seen.push(dive.state);
    }
    expect(seen.slice(0, 5)).toEqual(['surfaced', 'sinking', 'submerged', 'rising', 'surfaced']);
  });

  it('a frog on a submerged group drowns', () => {
    const game = emptyGame();
    const turtles = {
      kind: 'turtleGroup' as const,
      x: 5,
      length: 3,
      vel: 0,
      dive: { state: 'submerged' as const, timerMs: 60_000 },
    };
    lane(game, 1).objects.push(turtles);
    placeFrog(game, 1, 6);
    game.step([]);
    expect(game.deathCause).toBe('drowned');
  });

  it('a frog on a sinking or rising group is safe', () => {
    for (const state of ['sinking', 'rising'] as const) {
      const game = emptyGame();
      lane(game, 1).objects.push({
        kind: 'turtleGroup',
        x: 5,
        length: 3,
        vel: 0,
        dive: { state, timerMs: 60_000 },
      });
      placeFrog(game, 1, 6);
      game.step([]);
      expect(game.deathCause).toBeNull();
    }
  });
});
