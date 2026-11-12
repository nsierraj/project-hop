/** Logic runs at a fixed 60 Hz regardless of the display refresh rate (NFR-003). */
export const STEP_MS = 1000 / 60;

/** Longest frame time we accept. Longer gaps (tab switches, locks) are clamped to avoid a spiral. */
const MAX_FRAME_MS = 250;

export interface ClockTick {
  /** Number of fixed logic steps to run this frame. */
  steps: number;
  /** Fraction of a step left over, used to interpolate rendering between steps. */
  alpha: number;
}

export class FixedClock {
  private accumulator = 0;

  constructor(private readonly maxStepsPerFrame = 5) {}

  advance(frameMs: number): ClockTick {
    this.accumulator += Math.min(Math.max(frameMs, 0), MAX_FRAME_MS);
    let steps = 0;
    while (this.accumulator >= STEP_MS && steps < this.maxStepsPerFrame) {
      this.accumulator -= STEP_MS;
      steps++;
    }
    if (steps === this.maxStepsPerFrame) {
      // Drop the backlog instead of catching up over several frames.
      this.accumulator = 0;
    }
    return { steps, alpha: this.accumulator / STEP_MS };
  }

  reset(): void {
    this.accumulator = 0;
  }
}
