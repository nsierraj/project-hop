import { describe, expect, it } from 'vitest';
import { config, emptyGame } from './helpers';
import { finishHop } from './gameplay.helpers';
import { STEP_MS } from '../../src/core/clock';

describe('frog movement (FR-005 to FR-007)', () => {
  it('hops one tile and lasts about the configured hop duration', () => {
    const game = emptyGame();
    const hopSteps = Math.round(config().game.hop.durationMs / STEP_MS);
    game.step(['up']);
    expect(game.frog.row).toBe(11);
    expect(game.frog.hopTicks).toBe(hopSteps - 1);
    finishHop(game);
    expect(game.frog.hopTicks).toBe(0);
  });

  it('cannot change direction mid-hop: a second direction is buffered, not applied', () => {
    const game = emptyGame();
    game.step(['up']);
    game.step(['left']);
    expect(game.frog.col).toBe(6);
    finishHop(game);
    expect(game.frog.col).toBe(5);
  });

  it('keeps one buffered hop and drops the rest (FR-006)', () => {
    const game = emptyGame();
    game.step(['up']);
    game.step(['left']);
    game.step(['right']);
    game.step(['down']);
    expect(game.frog.buffered).toBe('left');
  });

  it('does not move below the start bank', () => {
    const game = emptyGame();
    game.step(['down']);
    expect(game.frog.row).toBe(12);
  });

  it('stops at the left and right edges (FR-007)', () => {
    const game = emptyGame();
    for (let i = 0; i < 10; i++) {
      game.step(['left']);
      finishHop(game);
    }
    expect(game.frog.col).toBe(0);
    game.step(['left']);
    expect(game.frog.col).toBe(0);
  });
});
