# Research: Frog Crossing Game (v1)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-12

All NEEDS CLARIFICATION items from the Technical Context are resolved below. The tech stack choice
(BRD OI-2) was made by the owner on 2026-11-12. The reference device was set by clarification
on the same date.

## R1. Fixed-timestep simulation

**Decision**: Run game logic on a fixed 60 Hz step using an accumulator. The render loop runs on
`requestAnimationFrame`, and each frame advances logic by whole steps. Rendering interpolates
between the last two logic states for smooth motion at any refresh rate.

**Rationale**: Gives identical play on 60, 120, and 144 Hz screens (NFR-003, SC in spec). Logic
is decoupled from frame timing, which makes replay and tests deterministic.

**Alternatives considered**:
- Per-frame delta time: simpler, but outcomes depend on frame timing, so the same input can give
  different results on different screens.
- Fixed step with no interpolation: deterministic, but visibly steps at 120 Hz and above.

## R2. Frame-rate verification on the reference device

**Decision**: Use the browser's performance timing in a debug overlay (frame time and dropped
frames) during the manual device pass on the iPhone SE (3rd generation). Record a 60-second run at
level 12 with the cap settings. Run the same check on one current desktop browser.

**Rationale**: AC-7 requires 60 fps on the named device. Automated tests in a headless browser do
not reflect real mobile GPU and Safari timing, so the check has to run on the device.

**Alternatives considered**:
- Headless Chromium frame counts: fast, but not representative of iOS Safari.
- Remote device lab: more coverage, but adds a paid dependency the project does not need.

## R3. Testability of game logic

**Decision**: Keep `src/core/` free of DOM and Canvas imports. Use a seeded RNG (`rng.ts`) so a
given seed and input sequence always gives the same state. Vitest runs the core directly under
Node.

**Rationale**: Covers AC-2 (death causes), AC-3 (dive cycles), AC-5 (scoring), and NFR-011 without
a browser. Deterministic seeds make failures reproducible.

**Alternatives considered**:
- Testing only through the browser: slower and harder to reproduce.
- Using `Math.random` with mocks: works, but makes replays and property tests harder to write.

## R4. Offline caching and installation

**Decision**: Use a Vite PWA plugin that generates the web app manifest and a Workbox service
worker at build time. The service worker precaches all built assets, so the game starts with no
network after one visit (FR-054, AC-8). The plugin's update flow exposes a "new version available"
event. The game shows the prompt only from the title or pause screen (FR-055).

**Rationale**: Build-time precache keeps the file list correct without manual upkeep. The plugin
handles the service worker lifecycle, which is the main source of PWA bugs on iOS (BRD R-4).

**Alternatives considered**:
- Hand-written service worker: full control, but a larger maintenance burden for one developer.
- Runtime caching only: smaller first download, but offline play would depend on what the player
  happened to load, which breaks AC-8.

## R5. Storage, audio, and haptics fallbacks

**Decision**:
- Storage: wrap every `localStorage` read and write in try/catch. On failure, keep state in memory
  for the session and show the FR-042 notice.
- Audio: create the audio context only after the first user gesture (FR-045).
- Haptics: feature-detect `navigator.vibrate` and call it only when present (FR-033).

**Rationale**: Blocked storage, iOS audio unlock rules, and missing vibration support are known
failure modes listed in the BRD (R-4) and in the spec's assumptions.

**Alternatives considered**:
- Relying on storage always working: breaks FR-042 in private browsing and on full quotas.
- Playing audio on load: blocked by browser autoplay rules.

## R6. Touch controls

**Decision**: Use Pointer Events for swipe and tap. Require a swipe of at least about 24 CSS px
along the dominant axis within a short time window. Tap anywhere on the playfield hops forward.
Block default touch behavior during play with `touch-action: none` on the canvas and a
non-passive listener that prevents zoom and scroll. Tune the threshold in `game.json` (BRD R-2).

**Rationale**: Pointer Events cover mouse, touch, and pen with one code path. The swipe threshold
lives in config so it can be tuned on real phones.

**Alternatives considered**:
- Touch Events only: works, but older API and less consistent across browsers.
- Third-party gesture library: adds weight and a dependency the spec does not need.

## R7. Color-blind safe palette and contrast

**Decision**: Give each object type a distinct sprite shape and outline pattern in addition to
hue. Check the palette against protanopia, deuteranopia, and tritanopia simulations during the
art step, and record the results in the repository. Check UI text contrast with a scripted
WCAG 2.2 check on the palette values in the build.

**Rationale**: FR-049 and AC-10 require distinguishable hazards without relying on color. A script
on the palette values catches regressions as the palette changes.

**Alternatives considered**:
- Manual check only: easy to skip when the palette changes.
- Hue-only distinction with labels: clutters the playfield and breaks the arcade look.

## Unresolved items

None. Items deferred to tasks or release, not planning:
- Final tuning values (BRD OI-4): set in `src/config/` and adjusted after playtests.
- Final game name (BRD OI-1): not needed for the build, but must not contain "Frogger" (AC-11).
- Art and audio source (BRD OI-3): an attribution file is part of the release checklist.
