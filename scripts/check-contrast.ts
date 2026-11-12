/**
 * Checks every UI text pair in src/render/palette.ts against WCAG 2.2 AA (4.5:1 for body text, FR-052).
 * Colour-blindness simulation is a manual check and is recorded in docs/accessibility.md.
 */
import { textPairs } from '../src/render/palette';
import { contrastRatio } from '../src/render/contrast';

const MIN_RATIO = 4.5;

let failures = 0;
for (const pair of textPairs) {
  const ratio = contrastRatio(pair.fg, pair.bg);
  const ok = ratio >= MIN_RATIO;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2).padStart(6)}:1  ${pair.name}`);
}

if (failures > 0) {
  console.error(`${failures} pair(s) below ${MIN_RATIO}:1`);
  process.exit(1);
}
console.log(`All ${textPairs.length} text pairs meet ${MIN_RATIO}:1`);
