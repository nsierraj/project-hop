export interface CanvasView {
  ctx: CanvasRenderingContext2D;
  /** Size of one tile in CSS pixels. Always a whole number (FR-047). */
  tile: number;
  /** CSS pixel offset of the playfield inside the canvas. */
  offsetX: number;
  offsetY: number;
  /** Rows reserved above the playfield for the HUD. */
  hudRows: number;
  /** Resets the transform for the current device pixel ratio and recomputes the layout. */
  resize(): void;
}

/**
 * Sizes the canvas to the window and picks the largest whole-number tile size that fits.
 * The playfield is centred, and the leftover space is filled with a border (FR-047).
 */
export function createCanvasView(
  canvas: HTMLCanvasElement,
  columns: number,
  rows: number,
  hudRows: number,
): CanvasView {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available');
  ctx.imageSmoothingEnabled = false;

  const view: CanvasView = {
    ctx,
    tile: 1,
    offsetX: 0,
    offsetY: 0,
    hudRows,
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const tile = Math.max(1, Math.floor(Math.min(cssWidth / columns, cssHeight / (rows + hudRows))));
      view.tile = tile;
      view.offsetX = Math.floor((cssWidth - tile * columns) / 2);
      view.offsetY = Math.floor((cssHeight - tile * (rows + hudRows)) / 2) + tile * hudRows;
    },
  };
  view.resize();
  return view;
}
