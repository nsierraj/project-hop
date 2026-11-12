/**
 * Frame-timing overlay for the reference-device check (research R2). Shown only with ?debug in the URL.
 */
export interface DebugOverlay {
  record(frameMs: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  enabled: boolean;
}

const DROP_THRESHOLD_MS = 1000 / 60 + 2;

export function createDebugOverlay(search = window.location.search): DebugOverlay {
  const samples: number[] = [];
  let dropped = 0;
  return {
    enabled: new URLSearchParams(search).has('debug'),
    record(frameMs) {
      samples.push(frameMs);
      if (samples.length > 120) samples.shift();
      if (frameMs > DROP_THRESHOLD_MS) dropped++;
    },
    draw(ctx) {
      if (samples.length === 0) return;
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      const fps = avg > 0 ? 1000 / avg : 0;
      ctx.save();
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(4, 4, 190, 40);
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      ctx.fillText(`fps ${fps.toFixed(1)}  frame ${avg.toFixed(1)} ms`, 10, 8);
      ctx.fillText(`dropped frames ${dropped}`, 10, 26);
      ctx.restore();
    },
  };
}
