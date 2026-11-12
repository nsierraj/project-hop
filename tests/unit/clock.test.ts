import { describe, expect, it } from 'vitest';
import { FixedClock, STEP_MS } from '../../src/core/clock';

/** Total logic steps produced over one second at a given refresh rate. */
function stepsOverOneSecond(refreshHz: number): number {
  const clock = new FixedClock();
  const frameMs = 1000 / refreshHz;
  let total = 0;
  for (let t = 0; t < 1000 - frameMs / 2; t += frameMs) {
    total += clock.advance(frameMs).steps;
  }
  return total;
}

describe('FixedClock', () => {
  it('runs about 60 logic steps per second at 60, 120, and 144 Hz (NFR-003)', () => {
    for (const hz of [60, 120, 144]) {
      expect(Math.abs(stepsOverOneSecond(hz) - 60)).toBeLessThanOrEqual(1);
    }
  });

  it('caps the steps in one frame so a long pause does not catch up all at once', () => {
    const clock = new FixedClock(5);
    expect(clock.advance(5000).steps).toBeLessThanOrEqual(5);
    expect(clock.advance(0).steps).toBe(0);
  });

  it('reports an interpolation alpha between 0 and 1', () => {
    const clock = new FixedClock();
    const { alpha } = clock.advance(STEP_MS * 0.5);
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThan(1);
  });
});
