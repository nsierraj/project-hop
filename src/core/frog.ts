import type { Grid } from './grid';
import type { LaneObject } from './lanes';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Frog {
  /** Column in tile units. Fractional while riding a moving object. */
  col: number;
  row: number;
  /** Logic steps left in the current hop. Zero means the frog is on the ground. */
  hopTicks: number;
  /** One pending hop, kept while a hop is in progress (FR-6). */
  buffered: Direction | null;
  /** The log or turtle group the frog is standing on, if any. */
  riding: LaneObject | null;
  /** Lowest row reached this life. Used for forward-hop points (FR-25). */
  maxRowReached: number;
}

export function createFrog(grid: Grid): Frog {
  return {
    col: grid.startCol,
    row: grid.startRow,
    hopTicks: 0,
    buffered: null,
    riding: null,
    maxRowReached: grid.startRow,
  };
}

/** The tile a hop in this direction would land on, or null if it would leave the grid. */
export function hopTarget(frog: Frog, dir: Direction, grid: Grid): { col: number; row: number } | null {
  const baseCol = Math.round(frog.col);
  let col = baseCol;
  let row = frog.row;
  switch (dir) {
    case 'up':
      row -= 1;
      break;
    case 'down':
      row += 1;
      break;
    case 'left':
      col -= 1;
      break;
    case 'right':
      col += 1;
      break;
  }
  if (row < 0 || row >= grid.rows || col < 0 || col > grid.lastCol) return null;
  return { col, row };
}

/** Starts a hop to the target tile. The frog's logical position changes now; the hop lasts hopSteps. */
export function startHop(frog: Frog, target: { col: number; row: number }, hopSteps: number): void {
  frog.col = target.col;
  frog.row = target.row;
  frog.hopTicks = hopSteps;
  frog.riding = null;
}
