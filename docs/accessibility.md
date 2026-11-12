# Accessibility Record

Scope: FR-038, FR-049, FR-050, FR-051, FR-052, AC-9, AC-10. Requirements are from
[specs/001-frog-crossing-game/spec.md](../specs/001-frog-crossing-game/spec.md).

## Automated checks

| Check | How to run | Result on 2026-11-12 |
|-------|------------|----------------------|
| UI text contrast, WCAG 2.2 AA (4.5:1) | `npm run contrast` | All 4 text pairs pass (lowest 13.15:1) |
| Contrast unit tests | `npm test` | Pass |
| Keyboard-only navigation of title, pause, and settings | `npm run test:e2e` (keyboard spec) | Pass on desktop and phone projects |

Full keyboard play through initials entry (AC-9) is not yet automated. It needs a deterministic
death sequence in the browser. It is listed as a manual step in `quickstart.md`.

## Manual checks

Colour-blindness simulation (AC-10) has **not been run yet**. Run it on each screen with
protanopia, deuteranopia, and tritanopia simulation, then record the result here.

| Object | Distinguishing cue besides hue | Simulation result |
|--------|--------------------------------|-------------------|
| Frog | Round body, two eyes, black outline | Not yet checked |
| Road vehicle | Rectangle with white diagonal stripes | Not yet checked |
| Log | Rounded bar with ring marks | Not yet checked |
| Turtle group (surfaced) | Full-height ellipses with outline | Not yet checked |
| Turtle group (sinking) | Dashed outline | Not yet checked |
| Turtle group (submerged) | Wave lines only, no shell | Not yet checked |
| Bay (empty / filled) | Square outline; filled bay has a centre mark | Not yet checked |
| Water / road / median / bank | Row colour, plus the objects above | Not yet checked |

## Speed assist

Speed assist sets lane speed to 70% and the life timer to 45 seconds (FR-050). It can only be
changed on the settings screen between games. It does not change point values. Assisted scores
show a `*` marker in the high-score table (FR-040).
