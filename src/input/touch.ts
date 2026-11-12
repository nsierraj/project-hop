import type { Action } from '../core/game';
import type { GameConfig } from '../config/loader';

export interface SwipeSettings {
  minDistanceCssPx: number;
  maxDurationMs: number;
}

/**
 * Turns touch gestures into hop actions. A swipe hops in its dominant direction. A tap hops forward
 * (FR-031). One gesture makes one action.
 */
export function classifyGesture(
  dx: number,
  dy: number,
  durationMs: number,
  swipe: SwipeSettings,
): Action | null {
  const distance = Math.hypot(dx, dy);
  if (durationMs > swipe.maxDurationMs && distance >= swipe.minDistanceCssPx) return null;
  if (distance < swipe.minDistanceCssPx) return 'up';
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function bindTouch(
  canvas: HTMLCanvasElement,
  cfg: GameConfig,
  onAction: (action: Action) => void,
): void {
  let start: { x: number; y: number; t: number } | null = null;

  canvas.addEventListener('pointerdown', (event) => {
    start = { x: event.clientX, y: event.clientY, t: performance.now() };
  });

  canvas.addEventListener('pointerup', (event) => {
    if (!start) return;
    const action = classifyGesture(
      event.clientX - start.x,
      event.clientY - start.y,
      performance.now() - start.t,
      cfg.swipe,
    );
    start = null;
    if (action) onAction(action);
  });

  canvas.addEventListener('pointercancel', () => {
    start = null;
  });

  // Stop pinch zoom and page scroll while a game is in progress (FR-032).
  const block = (event: Event) => event.preventDefault();
  canvas.addEventListener('touchmove', block, { passive: false });
  document.addEventListener('gesturestart', block, { passive: false });
  document.addEventListener('gesturechange', block, { passive: false });
}
