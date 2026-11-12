import { describe, expect, it } from 'vitest';
import { textPairs } from '../../src/render/palette';
import { contrastRatio } from '../../src/render/contrast';

describe('UI text contrast (FR-052)', () => {
  it.each(textPairs.map((p) => [p.name, p.fg, p.bg] as const))('%s meets 4.5:1', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('computes black on white as 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });
});
