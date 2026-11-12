import type { DiveState } from '../core/turtles';
import { palette } from './palette';

/*
 * Each sprite is drawn in tile units on a context already scaled so 1 unit = 1 tile.
 * Shapes and outlines carry the meaning; colour is secondary (FR-049).
 */

/** Frog: round body with two eyes and a dark outline. */
export function drawFrog(ctx: CanvasRenderingContext2D, x: number, y: number, lift: number): void {
  const cx = x + 0.5;
  const cy = y + 0.5 - lift;
  ctx.fillStyle = palette.frog;
  ctx.strokeStyle = palette.frogOutline;
  ctx.lineWidth = 0.06;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 0.34, 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = palette.frogOutline;
  ctx.beginPath();
  ctx.arc(cx - 0.14, cy - 0.12, 0.07, 0, Math.PI * 2);
  ctx.arc(cx + 0.14, cy - 0.12, 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** Road vehicle: a rectangle with diagonal white stripes. */
export function drawVehicle(ctx: CanvasRenderingContext2D, x: number, y: number, length: number): void {
  ctx.fillStyle = palette.vehicle;
  ctx.fillRect(x + 0.08, y + 0.18, length - 0.16, 0.64);
  ctx.strokeStyle = palette.vehicleStripe;
  ctx.lineWidth = 0.05;
  for (let s = 0.3; s < length - 0.2; s += 0.35) {
    ctx.beginPath();
    ctx.moveTo(x + s, y + 0.2);
    ctx.lineTo(x + s + 0.2, y + 0.8);
    ctx.stroke();
  }
}

/** Log: a brown rounded bar with ring marks. */
export function drawLog(ctx: CanvasRenderingContext2D, x: number, y: number, length: number): void {
  ctx.fillStyle = palette.log;
  ctx.beginPath();
  ctx.roundRect(x + 0.04, y + 0.16, length - 0.08, 0.68, 0.3);
  ctx.fill();
  ctx.strokeStyle = palette.logRing;
  ctx.lineWidth = 0.04;
  for (let r = 0.5; r < length - 0.3; r += 0.8) {
    ctx.beginPath();
    ctx.arc(x + r, y + 0.5, 0.16, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Turtle group: circles in a row. The shape changes with the dive state, so the warning reads without colour:
 * sinking shows dashed outlines, submerged shows only wave lines, rising shows half-height shells.
 */
export function drawTurtleGroup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  state: DiveState | null,
): void {
  const count = Math.round(length);
  for (let i = 0; i < count; i++) {
    const cx = x + i + 0.5;
    const cy = y + 0.5;
    if (state === 'submerged') {
      ctx.strokeStyle = palette.waterWave;
      ctx.lineWidth = 0.05;
      ctx.beginPath();
      ctx.moveTo(cx - 0.3, cy);
      ctx.quadraticCurveTo(cx - 0.15, cy - 0.08, cx, cy);
      ctx.quadraticCurveTo(cx + 0.15, cy + 0.08, cx + 0.3, cy);
      ctx.stroke();
      continue;
    }
    const height = state === 'rising' ? 0.22 : 0.34;
    ctx.fillStyle = palette.turtle;
    ctx.strokeStyle = palette.frogOutline;
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 0.32, height, 0, 0, Math.PI * 2);
    ctx.fill();
    if (state === 'sinking') {
      ctx.setLineDash([0.08, 0.08]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/** Home bay: a square with a notch when filled. */
export function drawBay(ctx: CanvasRenderingContext2D, x: number, y: number, filled: boolean): void {
  ctx.fillStyle = filled ? palette.bayFilled : palette.bayEmpty;
  ctx.strokeStyle = palette.frogOutline;
  ctx.lineWidth = 0.06;
  ctx.fillRect(x + 0.1, y + 0.1, 0.8, 0.8);
  ctx.strokeRect(x + 0.1, y + 0.1, 0.8, 0.8);
  if (filled) {
    ctx.fillStyle = palette.frogOutline;
    ctx.fillRect(x + 0.3, y + 0.3, 0.4, 0.4);
  }
}
