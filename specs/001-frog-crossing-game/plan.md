# Implementation Plan: Frog Crossing Game (v1)

**Branch**: `001-frog-crossing-game` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-frog-crossing-game/spec.md`

## Summary

Build a browser road-and-river crossing game in which a frog hops across a 13 by 13 grid to fill
five home bays. The game runs as a static, offline-capable Progressive Web App hosted on GitHub
Pages. Game rules run on a fixed timestep and are kept free of rendering code, so they can be
tested without a browser. Rendering uses the Canvas 2D API. Tuning values live in config files.
Scores and settings persist only in local browser storage.

Technical approach, from [research.md](./research.md): TypeScript for typed logic and config,
Vite for the build, a service worker generated at build time for offline caching, Vitest for
logic tests, and Playwright for end-to-end checks of keyboard play, touch gestures, and offline
launch.

## Technical Context

**Language/Version**: TypeScript (current stable), compiled to ES2020+ modules for current browsers

**Primary Dependencies**: Vite (build and dev server), a PWA plugin that generates the service
worker and manifest (Workbox under the hood). No runtime framework. Rendering uses the Canvas 2D
API directly.

**Storage**: Browser `localStorage` for top-10 scores and settings only. Each key is versioned
(see [contracts/storage.md](./contracts/storage.md)). Storage access is wrapped so a blocked or
full store falls back to in-memory play (FR-042).

**Testing**: Vitest for unit tests of the pure game core (collision, scoring, levels, turtle dive
cycles, config loading). Playwright for end-to-end tests: keyboard-only full game, touch gestures
at a phone viewport, and offline launch after one visit. Manual device pass per NFR-011.

**Target Platform**: Current two major versions of Chrome, Edge, Firefox, and Safari on desktop;
Safari on iOS; Chrome on Android. Portrait phone layout from 360 px wide up to 4K monitors.
Reference device for frame-rate testing: iPhone SE (3rd generation, 2022), per the 2026-11-12
clarification.

**Project Type**: Static single-page web application (PWA). No server component.

**Performance Goals**: 60 fps sustained on the reference device at level 12 and on current
desktops (NFR-002, AC-7). Input-to-hop latency under 50 ms (NFR-004). Fixed 60 Hz logic step
(NFR-003).

**Constraints**: Full download under 3 MB including art and audio (NFR-005). Playable within 3 s on
4G on first visit, under 1 s on repeat visits (NFR-006). No cookies, trackers, or third-party
scripts (NFR-007). Works fully offline after one visit (FR-054). Hosted as static files over
HTTPS (NFR-009).

**Scale/Scope**: One player per device. Single-player, single-screen game. Roughly 13 by 13
tiles, 5 river lanes, 5 road lanes, 5 bays. Top-10 score table. 56 functional and 10
non-functional requirements in the spec, grouped into 7 user stories.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against `.specify/memory/constitution.md` v1.0.0.

| Principle | Gate | Status |
|-----------|------|--------|
| I. Deterministic Fixed-Timestep Simulation | Logic on a fixed 60 Hz step; logic free of rendering; seeded RNG; headless tests | Pass. Designed in `src/core/` with no DOM or Canvas imports. See research.md R1 and R3. |
| II. Configuration Over Constants | Lanes, speeds, timers, thresholds, and points in config; one loader | Pass. `src/config/` JSON files validated at load. See contracts/config.md. |
| III. Accessible by Default | Keyboard-only play; shape-based hazard cues; WCAG AA contrast; speed assist | Pass. Focus management in `src/ui/`; shape and pattern sprites; contrast checked in the palette step. See research.md R7. |
| IV. Private, Static, and Offline-First | No server, cookies, trackers, or third-party scripts; offline after first load | Pass. Static build; no external requests in the build; service worker precache. See research.md R4 and R5. |
| V. Original Work Only | Original or licensed assets with recorded attribution; no "Frogger" or Konami trade dress | Pass with a recorded task. Asset attribution file is required before release (see Phase 2 tasks, to be created by `/speckit-tasks`). |
| Platform and Performance Constraints | Browser matrix, 60 fps, 3 MB, load times, layout range, portrait-only | Pass. Size budget and frame-rate checks become test tasks. Verified in quickstart.md. |
| Development Workflow and Quality Gates | Tests for collision, scoring, progression, dive cycles; device pass; README | Pass. Each area has a unit test suite. Device pass is a release step in quickstart.md. |

**Result**: No violations. Complexity Tracking below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-frog-crossing-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── config.md        # Tuning file schema
│   └── storage.md       # localStorage keys and JSON shapes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks, not created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── core/                # Pure game logic. No DOM or Canvas imports.
│   ├── rng.ts           # Seeded random number generator
│   ├── clock.ts         # Fixed-timestep accumulator (60 Hz logic step)
│   ├── grid.ts          # Grid geometry and row layout
│   ├── frog.ts          # Hop state, buffering, edge checks
│   ├── lanes.ts         # Lane objects, spawning, wrapping
│   ├── turtles.ts       # Diving turtle state cycle
│   ├── collision.ts     # Hitboxes and death causes
│   ├── scoring.ts       # Points and time bonus
│   ├── levels.ts        # Level progression and cap
│   └── game.ts          # State machine: title, playing, paused, clear, over
├── config/
│   ├── game.json        # Points, lives, timer, bonus threshold
│   ├── levels.json      # Lane speeds, density, dive share, cap level
│   ├── layout.json      # Row layout and lane definitions
│   └── loader.ts        # Load and validate config once at startup
├── render/
│   ├── canvas.ts        # Scales the grid to the screen; whole-number pixel scale
│   ├── sprites.ts       # Sprite atlas and shape-based hazard sprites
│   └── hud.ts           # HUD drawn outside the grid
├── input/
│   ├── keyboard.ts      # Arrow keys, WASD, P, Esc, Enter, Space
│   └── touch.ts         # Swipe threshold, tap-forward, gesture blocking
├── audio/
│   └── audio.ts         # Effects and music; starts after first interaction
├── ui/
│   ├── menus.ts         # Title, pause, settings, high scores, initials entry
│   ├── focus.ts         # Visible focus ring and keyboard navigation
│   └── hint.ts          # First-launch control hint
├── storage/
│   ├── store.ts         # Safe wrapper over localStorage with in-memory fallback
│   ├── highscores.ts    # Top-10 table
│   └── settings.ts      # Persisted settings
├── pwa/
│   └── update.ts        # "Update available" prompt, never during a game
└── main.ts              # Wires modules together and starts the loop

public/
├── icons/               # Manifest icons, including maskable
└── ATTRIBUTIONS.md      # Recorded attribution for licensed assets (if any)

tests/
├── unit/                # Vitest: core logic, config loader, storage fallback
└── e2e/                 # Playwright: keyboard run, touch gestures, offline launch

index.html
vite.config.ts
package.json
README.md
```

**Structure Decision**: Single static web project at the repository root. Pure game logic lives
in `src/core/`, with no DOM or Canvas imports, so it can be tested without a browser and
fixed-timestep rules can be checked. Rendering, input, audio, and storage sit in their own
folders and depend on `core`, never the reverse. Tuning files are in `src/config/` and loaded once.
This matches the constitution's separation of logic from rendering (Principle I) and the
configuration rule (Principle II).

## Complexity Tracking

No constitution violations. Nothing to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |
