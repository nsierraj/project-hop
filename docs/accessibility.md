# Accessibility Record

Scope: FR-038, FR-049, FR-050, FR-051, FR-052, AC-9, AC-10. Requirements are from
[specs/001-frog-crossing-game/spec.md](../specs/001-frog-crossing-game/spec.md).

## Automated checks

| Check | How to run | Result on 2026-11-12 |
|-------|------------|----------------------|
| UI text contrast, WCAG 2.2 AA (4.5:1) | `npm run contrast` | All 4 text pairs pass (lowest 13.15:1) |
| Contrast unit tests | `npm test` | Pass |
| Keyboard-only navigation of title, pause, and settings | `npm run test:e2e` (keyboard spec) | Pass on desktop and phone projects |
| Full keyboard game to initials entry (AC-9) | `npm run test:e2e` (keyboard spec) | Pass on all desktop projects and the phone project |
| Colour-blindness simulation (AC-10) | `npm run colorblind` | Pass, all 11 pairs at Delta E 10 or more |

## Colour-blindness check (AC-10)

`npm run colorblind` simulates protanopia, deuteranopia, and tritanopia (Machado et al. 2009,
full severity) and measures the colour difference (CIE76 Delta E) between each hazard and the
surface it sits on. A Delta E of 10 or more counts as clearly different.

| Pair | Lowest Delta E across the three simulations | Result |
|------|---------------------------------------------|--------|
| Vehicle on road | 33.2 | Pass |
| Log on water | 46.6 | Pass |
| Turtle on water | 14.0 (tritanopia) | Pass |
| Submerged turtle on water | 21.8 | Pass |
| Frog on road | 51.8 | Pass |
| Frog on median | 28.8 | Pass |
| Empty bay on home row | 57.7 | Pass |
| Filled bay on home row | 25.4 | Pass |
| Wall on home row | 33.6 | Pass |
| Water on road | 25.9 | Pass |
| Median on road | 51.7 | Pass |

This is an approximation of how colour looks, not a clinical test. Shapes and outlines also differ
for every hazard (FR-049), so no object depends on colour alone.

## Speed assist

Speed assist sets lane speed to 70% and the life timer to 45 seconds (FR-050). It can only be
changed on the settings screen between games. It does not change point values. Assisted scores
show a `*` marker in the high-score table (FR-040).
