import type { Game } from '../core/game';
import { drawBay, drawFrog, drawLog, drawTurtleGroup, drawVehicle } from './sprites';
import type { CanvasView } from './canvas';
import { palette } from './palette';

const BORDER_TILES = 1;

/** Draws every row, bay, lane object, and the frog. Positions are in tile units. */
export function drawPlayfield(view: CanvasView, game: Game): void {
  const { ctx, tile, offsetX, offsetY } = view;
  const grid = game.grid;
  const width = grid.columns * tile;
  const height = grid.rows * tile;

  ctx.fillStyle = palette.border;
  ctx.fillRect(offsetX - BORDER_TILES * tile, offsetY - BORDER_TILES * tile, width + 2 * BORDER_TILES * tile, height + 2 * BORDER_TILES * tile);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(tile, tile);

  for (let row = 0; row < grid.rows; row++) {
    ctx.fillStyle = rowColour(grid.rowKind(row));
    ctx.fillRect(0, row, grid.columns, 1);
  }

  ctx.fillStyle = palette.wall;
  for (let col = 0; col < grid.columns; col++) {
    if (grid.bayIndexForCol(col) < 0) ctx.fillRect(col, 0, 1, 1);
  }
  game.bays.forEach((bay, i) => drawBay(ctx, grid.bayCols[i], 0, bay.filled));

  for (const lane of game.lanes) {
    ctx.strokeStyle = palette.laneLine;
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(0, lane.rowIndex + 1);
    ctx.lineTo(grid.columns, lane.rowIndex + 1);
    ctx.stroke();

    for (const obj of lane.objects) {
      // Draw objects that wrap across the edge at both ends so they never pop in halfway.
      for (const offset of [-grid.columns - 4, 0, grid.columns + 4]) {
        const x = obj.x + offset;
        if (obj.kind === 'vehicle') drawVehicle(ctx, x, lane.rowIndex, obj.length);
        else if (obj.kind === 'log') drawLog(ctx, x, lane.rowIndex, obj.length);
        else drawTurtleGroup(ctx, x, lane.rowIndex, obj.length, obj.dive?.state ?? null);
      }
    }
  }

  // The frog arcs up while it is in the air. It is hidden during the death animation.
  if (game.deathTicks === 0) {
    const progress = game.frog.hopTicks > 0 ? 1 - game.frog.hopTicks / game.hopSteps : 1;
    const lift = Math.sin(Math.PI * Math.min(Math.max(progress, 0), 1)) * 0.25;
    drawFrog(ctx, game.frog.col, game.frog.row, lift);
  }

  ctx.restore();
}

function rowColour(kind: string): string {
  switch (kind) {
    case 'home':
      return palette.homeRow;
    case 'river':
      return palette.water;
    case 'median':
      return palette.median;
    case 'road':
      return palette.road;
    default:
      return palette.bank;
  }
}
