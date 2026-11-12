import type { Game } from '../../src/core/game';
import type { LaneObject } from '../../src/core/lanes';

/** Puts the frog on a tile and optionally on an object, with no hop in progress. */
export function placeFrog(game: Game, row: number, col: number, riding?: LaneObject): void {
  game.frog.row = row;
  game.frog.col = col;
  game.frog.hopTicks = 0;
  game.frog.buffered = null;
  game.frog.riding = riding ?? null;
}

export function lane(game: Game, row: number) {
  const found = game.lanes.find((l) => l.rowIndex === row);
  if (!found) throw new Error(`no lane on row ${row}`);
  return found;
}

/** A still object (no velocity) at x with the given length. */
export function still(kind: LaneObject['kind'], x: number, length: number): LaneObject {
  return { kind, x, length, vel: 0, dive: null };
}

/** Runs steps until the current hop has landed. */
export function finishHop(game: Game): void {
  for (let i = 0; i < 20 && game.frog.hopTicks > 0; i++) game.step([]);
}
