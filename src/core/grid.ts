import type { LayoutConfig, RowKind } from '../config/loader';

/** Creates the grid helpers from the layout config. Row 0 is the home row; the last row is the bank. */
export function createGrid(layout: LayoutConfig) {
  const columns = layout.grid.columns;
  const rows = layout.grid.rows;
  const lastCol = columns - 1;
  const startRow = rows - 1;
  const startCol = Math.floor(columns / 2);

  // Bays sit on odd columns of the home row (1, 3, 5, 7, 9). Even columns are walls (FR-002).
  const bayCols = [1, 3, 5, 7, 9];

  const rowKind = (row: number): RowKind => layout.rows[row].kind;

  const bayIndexForCol = (col: number): number => bayCols.indexOf(col);

  const clampCol = (col: number): number => Math.min(Math.max(col, 0), lastCol);

  return { columns, rows, lastCol, startRow, startCol, bayCols, rowKind, bayIndexForCol, clampCol };
}

export type Grid = ReturnType<typeof createGrid>;
