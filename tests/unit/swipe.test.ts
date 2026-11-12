import { describe, expect, it } from 'vitest';
import { config } from './helpers';
import { classifyGesture } from '../../src/input/touch';

const swipe = config().game.swipe;

describe('touch gestures (FR-031)', () => {
  it('hops in the dominant direction of a swipe of at least 24 CSS px', () => {
    expect(classifyGesture(40, 5, 150, swipe)).toBe('right');
    expect(classifyGesture(-40, 5, 150, swipe)).toBe('left');
    expect(classifyGesture(5, 40, 150, swipe)).toBe('down');
    expect(classifyGesture(5, -40, 150, swipe)).toBe('up');
  });

  it('treats a short movement as a tap, which hops forward', () => {
    expect(classifyGesture(3, 4, 80, swipe)).toBe('up');
  });

  it('ignores a slow drag that is too long to count as a swipe', () => {
    expect(classifyGesture(60, 0, swipe.maxDurationMs + 200, swipe)).toBeNull();
  });
});
