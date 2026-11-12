import type { Grid } from './grid';

export interface Bay {
  index: number;
  filled: boolean;
}

export function createBays(count: number): Bay[] {
  return Array.from({ length: count }, (_, index) => ({ index, filled: false }));
}

export type BayOutcome = { kind: 'fill'; index: number } | { kind: 'death'; cause: 'wall' | 'bay' };

/**
 * Resolves a landing on the home row. Odd columns are bays and even columns are walls (FR-12).
 * Landing on a wall or an already filled bay is a death.
 */
export function resolveHomeLanding(bays: Bay[], col: number, grid: Grid): BayOutcome {
  const index = grid.bayIndexForCol(Math.round(col));
  if (index < 0) return { kind: 'death', cause: 'wall' };
  if (bays[index].filled) return { kind: 'death', cause: 'bay' };
  return { kind: 'fill', index };
}

export function allFilled(bays: Bay[]): boolean {
  return bays.every((bay) => bay.filled);
}
