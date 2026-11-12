/**
 * AC-10: every hazard and safe zone must stay distinguishable under protanopia, deuteranopia, and
 * tritanopia simulation. Each pair is a hazard and the surface it sits on, or two objects that share a row.
 * Colour is not the only cue: shapes and outlines also differ (FR-049). This script checks colour
 * contrast under simulation as a second, independent check.
 */
import { palette } from '../src/render/palette';
import { CVD_TYPES, simulatedHexDistance } from '../src/render/colorblind';

/** Delta E (CIE76) at or above this value counts as clearly different. */
const MIN_DELTA_E = 10;

const pairs: { name: string; a: string; b: string }[] = [
  { name: 'vehicle on road', a: palette.vehicle, b: palette.road },
  { name: 'log on water', a: palette.log, b: palette.water },
  { name: 'turtle on water', a: palette.turtle, b: palette.water },
  { name: 'submerged turtle on water', a: palette.turtleSubmerged, b: palette.water },
  { name: 'frog on road', a: palette.frog, b: palette.road },
  { name: 'frog on median', a: palette.frog, b: palette.median },
  { name: 'empty bay on home row', a: palette.bayEmpty, b: palette.homeRow },
  { name: 'filled bay on home row', a: palette.bayFilled, b: palette.homeRow },
  { name: 'wall on home row', a: palette.wall, b: palette.homeRow },
  { name: 'water on road', a: palette.water, b: palette.road },
  { name: 'median on road', a: palette.median, b: palette.road },
];

let failures = 0;
for (const type of CVD_TYPES) {
  for (const pair of pairs) {
    const d = simulatedHexDistance(pair.a, pair.b, type);
    const ok = d >= MIN_DELTA_E;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${type.padEnd(12)} dE ${d.toFixed(1).padStart(5)}  ${pair.name}`);
  }
}

if (failures > 0) {
  console.error(`${failures} pair(s) below dE ${MIN_DELTA_E} under simulation`);
  process.exit(1);
}
console.log(`All ${pairs.length} pairs at dE ${MIN_DELTA_E}+ under ${CVD_TYPES.length} simulations`);
