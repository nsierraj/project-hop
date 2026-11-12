# Tasks: Frog Crossing Game (v1)

**Input**: Design documents from `/specs/001-frog-crossing-game/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included. NFR-011 explicitly requires automated tests for collision, scoring, level progression, and turtle dive cycles, and the constitution's quality gates require them. End-to-end tests cover AC-8 and AC-9.

**Organization**: Tasks are grouped by user story so each story can be built and tested on its own.

**Audio note**: The spec has no audio user story. Audio requirements (FR-043 to FR-045) are split across the stories that trigger each sound, and music and volume settings sit in US6.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1 to US7)
- Every task names an exact file path

## Path Conventions

Single static web project at the repository root, per [plan.md](./plan.md). Source is in `src/`,
tests in `tests/`, and static files in `public/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create `package.json` at repo root with dev dependencies for TypeScript, Vite, Vitest, Playwright, ESLint, and Prettier, plus scripts `dev`, `build`, `preview`, `test`, and `test:e2e`
- [X] T002 [P] Create `tsconfig.json` at repo root with `strict: true`, ES2020 target, and `src` and `tests` includes
- [X] T003 [P] Create `vite.config.ts` at repo root with the build and dev server settings for a static site
- [X] T004 [P] Create `index.html` at repo root with a viewport meta tag, a single canvas element, and no external scripts, styles, or fonts (NFR-008)
- [X] T005 [P] Create `vitest.config.ts` at repo root that runs `tests/unit/**/*.test.ts` in Node
- [X] T006 [P] Create `playwright.config.ts` at repo root with two projects: a phone viewport of 390 x 844 with touch enabled, and a desktop viewport. Both run against `vite preview`.
- [X] T007 [P] Create `eslint.config.js` and `.prettierrc` at repo root
- [X] T008 [P] Create the folder skeleton from plan.md with a `.gitkeep` in each empty folder: `src/core/`, `src/config/`, `src/render/`, `src/input/`, `src/audio/`, `src/ui/`, `src/storage/`, `src/pwa/`, `tests/unit/`, `tests/e2e/`, `public/icons/`
- [X] T009 [P] Create `public/ATTRIBUTIONS.md` with a heading and a note that licensed assets are listed here before release (Constitution Principle V)
- [X] T010 [P] Add `node_modules/`, `dist/`, `playwright-report/`, and `test-results/` to `.gitignore` at repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story is implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 [P] Create `src/config/game.json` with the values from `contracts/config.md` (lives, timers, points, hop, swipe, speed assist, high score settings)
- [X] T012 [P] Create `src/config/levels.json` with the values from `contracts/config.md` (cap level 12, speed and density curves, dive share, log length)
- [X] T013 [P] Create `src/config/layout.json` with the 13-row layout from `contracts/config.md` (home, 5 river, median, 5 road, bank)
- [X] T014 Implement `src/config/loader.ts` to validate the three config files against the constraints in `contracts/config.md`. A failure throws an error naming the file and key. Depends on T011, T012, T013.
- [X] T015 [P] Implement `src/core/rng.ts`: a seeded PRNG with `next()` and `nextInt(min, max)`. The same seed must give the same sequence (research R3).
- [X] T016 [P] Implement `src/core/clock.ts`: a fixed 60 Hz accumulator that returns the number of logic steps for each frame and an interpolation alpha. Clamp the maximum steps per frame to avoid a spiral after a pause (research R1).
- [X] T017 [P] Implement `src/core/grid.ts`: constants for 13 columns and 13 rows, a lookup from row index to row kind using the layout config, and a helper to map tile coordinates to pixels
- [X] T018 [P] Implement `src/storage/store.ts`: a safe `localStorage` wrapper. Each read and write is in try/catch. Reads return defaults on failure. A failed write switches to in-memory mode and sets a `notice` flag (FR-042, contracts/storage.md rule 3).
- [X] T019 Implement `src/core/game.ts` skeleton: the `GameState` type from `data-model.md` and the mode transitions (title, playing, paused, levelClear, gameOver, highScores, settings). Depends on T015, T017.
- [X] T020 Implement `src/render/canvas.ts`: canvas sizing with a whole-number pixel scale, smoothing off, a themed border around the leftover space, and a safe-area inset for notched phones (FR-047, NFR-007)
- [X] T021 [P] Implement `src/input/keyboard.ts`: map arrow keys, WASD, P, Esc, Enter, and Space to logical actions (`hopUp`, `hopLeft`, `hopRight`, `hopDown`, `pause`, `back`, `confirm`) and emit them to a handler
- [X] T022 Implement `src/main.ts`: connect the clock to the core update step and the render call on `requestAnimationFrame`, and start in title mode. Depends on T016, T019, T020, T021.
- [X] T023 [P] Implement `src/render/debugOverlay.ts`: frame time and dropped-frame counts, shown only when the URL contains `?debug` (research R2)
- [X] T024 [P] Write `tests/unit/rng.test.ts` and `tests/unit/clock.test.ts`. The clock test checks that the same total time gives the same step count at 60, 120, and 144 Hz refresh rates (NFR-003).
- [X] T025 [P] Write `tests/unit/loader.test.ts`. A valid config loads. An invalid key throws an error that names the file and key (Principle II).

**Checkpoint**: Foundation ready. User story implementation can begin.

---

## Phase 3: User Story 1 - Cross the Road and Survive (Priority: P1) 🎯 MVP

**Goal**: The player hops a frog across the road, touching a vehicle or running out of time costs one life, and the frog returns to the start bank.

**Independent Test**: Start a game, hop across the five road lanes to the median, then touch a vehicle. Exactly one life is lost, and the frog returns to the start bank with a fresh timer.

### Tests for User Story 1 (required by NFR-011 for collision)

- [X] T026 [P] [US1] Write `tests/unit/frog.test.ts`: a hop moves one tile in about 120 ms; the direction cannot change mid-hop; one input is buffered and the rest are dropped; the frog stops at the start bank and at the left and right edges (FR-005, FR-006, FR-007)
- [X] T027 [P] [US1] Write `tests/unit/collision.test.ts`: contact with a road vehicle costs exactly one life and returns the frog to the start bank (AC-2, road case); the life timer reaching zero costs one life (FR-013); a hitbox is smaller than its sprite (FR-014)

### Implementation for User Story 1

- [X] T028 [P] [US1] Implement `src/core/frog.ts`: the `Frog` type from `data-model.md`, hop state, one-input buffer, and bounds checks (FR-005 to FR-008 for the road part)
- [X] T029 [P] [US1] Implement `src/core/lanes.ts`: the `Lane` and `LaneObject` types for road lanes. Vehicles move in the lane direction, wrap or respawn off-screen, and vary in length from the RNG (FR-004, FR-009)
- [X] T030 [US1] Implement `src/core/collision.ts`: the road death check using a hitbox smaller than the sprite (FR-014). Depends on T028, T029.
- [X] T031 [US1] Implement `src/core/lifeTimer.ts`: a countdown from `lifeTimerSeconds` in config, with a reset on death and a `warning` flag for the last `warningSeconds` (FR-021)
- [X] T032 [US1] Update `src/core/game.ts`: on death, remove one life, return the frog to the start bank, reset the life timer, and enter a short death-animation state. Enter `gameOver` when lives reach 0 (FR-015, FR-024). Depends on T030, T031.
- [X] T033 [P] [US1] Implement shape-based sprites for the frog and road vehicles in `src/render/sprites.ts` (FR-049, placeholder art acceptable until US5 palette work)
- [X] T034 [US1] Implement `src/render/playfield.ts`: draw the start bank and road lanes from the grid and the lane state
- [X] T035 [US1] Implement `src/render/hud.ts`: remaining lives and the timer bar, placed outside the grid. The bar changes shape in the last 5 seconds (FR-003, FR-021).
- [X] T036 [US1] Wire keyboard hop actions to the frog in `src/main.ts` and `src/core/game.ts` (FR-030). Depends on T022, T028, T032.
- [X] T037 [US1] Implement `src/audio/audio.ts`: an audio context created only after the first user gesture (FR-045), with an effect player and a hop sound and a vehicle-death sound (FR-043 for these two)
- [X] T038 [US1] Implement `src/ui/title.ts`: a title screen that starts a game on Enter or Space and on a tap, using the mode transitions in `src/core/game.ts`

**Checkpoint**: At this point, User Story 1 works on its own. A player can cross the road and lose lives on contact or timeout.

---

## Phase 4: User Story 2 - Cross the River and Fill the Bays (Priority: P1)

**Goal**: After the road, the frog crosses the median and river on logs and turtles, drowns on submerged turtles, and fills the five bays to clear the level.

**Independent Test**: Cross the river on logs and turtles, reach an empty bay, fill all five bays, and confirm the level clears and the next level starts with empty bays.

### Tests for User Story 2 (required by NFR-011 for dive cycles and collision)

- [X] T039 [P] [US2] Write `tests/unit/turtles.test.ts`: the dive cycle runs surfaced, sinking, submerged, rising, surfaced; the sinking warning lasts at least 750 ms; a frog on submerged drowns; a frog on sinking or rising is safe (AC-3, FR-16 to FR-18)
- [X] T040 [P] [US2] Write `tests/unit/river.test.ts`: landing on open water kills; being carried past an edge kills; riding moves the frog with the object; lateral hops work while riding (FR-8, FR-10, FR-11)
- [X] T041 [P] [US2] Write `tests/unit/bays.test.ts`: a bay wall or filled bay kills; an empty bay fills and the frog returns to the start bank; filled bays stay filled after a death; five filled bays clear the level (FR-12, FR-15, FR-22)

### Implementation for User Story 2

- [X] T042 [P] [US2] Implement `src/core/turtles.ts`: the diving turtle group state machine with the states and timings in `data-model.md`. The share of diving groups comes from the level (FR-16, FR-18, FR-19).
- [X] T043 [US2] Extend `src/core/lanes.ts` for river lanes: logs and turtle groups, spawn lengths from config, and logs that shorten with level (FR-4, FR-23). Depends on T042.
- [X] T044 [P] [US2] Implement `src/core/bays.ts`: the `Bay` state, fill rules, and the wall and filled-bay kill rules (FR-12, FR-15, FR-22)
- [X] T045 [US2] Extend `src/core/collision.ts`: water, edge carry, submerged drowning, and bay outcomes. Depends on T042, T044.
- [X] T046 [US2] Extend `src/core/frog.ts`: ride an object, move with it, and allow lateral hops while riding (FR-8)
- [X] T047 [US2] Update `src/core/game.ts`: clear the level when all bays fill, show the `levelClear` mode with a celebration timer, and reset bays for the next level (FR-22). Depends on T044.
- [X] T048 [US2] Extend `src/render/playfield.ts`: draw the median, river lanes, logs, turtle groups in each dive state, the home row with bays and walls
- [X] T049 [US2] Add sprites for logs, turtle groups in each dive state, bays, and water in `src/render/sprites.ts`. Each object type differs by shape and outline, not hue alone (FR-049).
- [X] T050 [US2] Add the timer warning sound and the level-clear sound in `src/audio/audio.ts` (FR-043)
- [X] T051 [US2] Implement `src/ui/levelClear.ts`: the celebration screen shown between levels

**Checkpoint**: At this point, User Stories 1 and 2 work together. A full level can be cleared.

---

## Phase 5: User Story 3 - Score Points and Progress Through Levels (Priority: P2)

**Goal**: Points come from forward hops, bays, time bonus, and level clears. Difficulty rises each level until the cap, and a bonus life is awarded once.

**Independent Test**: Play one level, check the score against the scoring rules, and clear several levels to confirm the difficulty stops rising at level 12.

### Tests for User Story 3 (required by NFR-011 for scoring and progression)

- [X] T052 [P] [US3] Write `tests/unit/scoring.test.ts`: 10 points for a forward hop to a new row only; 50 points per bay plus 10 per full second left; 1,000 per level clear; no double counting (AC-5, FR-25 to FR-28)
- [X] T053 [P] [US3] Write `tests/unit/levels.test.ts`: speeds, density, dive share, and log length rise until the cap; the values stay flat after level 12 (AC-4, FR-23)
- [X] T054 [P] [US3] Write `tests/unit/bonusLife.test.ts`: the bonus life is awarded once when the score reaches 10,000; lives never exceed 5 (FR-20)

### Implementation for User Story 3

- [X] T055 [P] [US3] Implement `src/core/scoring.ts`: the score events and time bonus from `game.json` (FR-25 to FR-29)
- [X] T056 [P] [US3] Implement `src/core/levels.ts`: `effectiveLevel = min(level, capLevel)` and the derived curves from `data-model.md` (FR-023)
- [X] T057 [US3] Update `src/core/game.ts`: apply score events, track `maxRowReached` per life, award the bonus life once, and enforce the 5-life maximum (FR-20, FR-25). Depends on T055.
- [X] T058 [US3] Update `src/render/hud.ts`: show score, high score, and level number (FR-3)
- [X] T059 [US3] Implement `src/ui/gameOver.ts`: the game-over screen with the final score. The initials prompt is added in US6. (FR-24)

**Checkpoint**: At this point, scoring and progression work. The game can be played for score.

---

## Phase 6: User Story 4 - Play on a Phone with Touch Controls (Priority: P2)

**Goal**: A phone player starts with one tap, hops with swipes and taps, and the page does not scroll or zoom during play. The game pauses when hidden, shows a rotate-device screen in landscape, and shows a first-launch hint.

**Independent Test**: On a phone viewport, start with one tap, hop in all four directions by swipe, hop forward by tap, and switch tabs to confirm the game pauses.

### Tests for User Story 4

- [X] T060 [P] [US4] Write `tests/unit/swipe.test.ts`: a swipe of at least 24 CSS px on the dominant axis makes one hop; a tap hops forward; a second gesture before the first hop ends is buffered or dropped per FR-6 (FR-31)
- [ ] T061 [US4] Write `tests/e2e/touch.spec.ts` in the phone project: swipes and taps move the frog; the page does not scroll, zoom, or refresh during play (FR-032); hiding the page pauses the game (FR-036). Depends on T063, T064, T065.

### Implementation for User Story 4

- [X] T062 [P] [US4] Implement `src/input/touch.ts`: Pointer Events for swipe and tap-forward. The threshold comes from `game.json` (research R6, FR-31).
- [X] T063 [US4] Block zoom, scroll, and refresh during play in `src/input/touch.ts`: `touch-action: none` on the canvas and non-passive handlers that call `preventDefault` (FR-032). Depends on T062.
- [X] T064 [US4] Pause on `visibilitychange` and window blur in `src/main.ts` (FR-036). Depends on T022.
- [X] T065 [P] [US4] Implement `src/audio/haptics.ts`: feature-detect `navigator.vibrate` and pulse on death and bay arrival. Skip silently when unsupported (FR-033, BRD assumption on iOS).
- [X] T066 [US4] Implement `src/ui/rotate.ts`: show a rotate-device screen and pause when a phone is held in landscape (FR-048)
- [X] T067 [US4] Implement `src/ui/hint.ts`: a one-screen control hint for the device type, shown on first launch. It records `hop.hintSeen.v1` through `src/storage/store.ts` and can be reopened from the pause menu (FR-034)
- [X] T068 [US4] Implement `src/ui/pauseMenu.ts`: resume, reopen the control hint, and return to title (FR-035, FR-034)

**Checkpoint**: At this point, the game is fully playable on a phone.

---

## Phase 7: User Story 5 - Play with the Keyboard and Accessible Visuals (Priority: P2)

**Goal**: Every menu works with the keyboard alone, with a visible focus indicator. Hazards differ by shape and outline, and UI text meets WCAG AA contrast. Speed assist is available.

**Independent Test**: Complete a full game with the keyboard alone. Check each hazard type under color-blindness simulation and check text contrast.

### Tests for User Story 5

- [X] T069 [P] [US5] Write `tests/unit/speedAssist.test.ts`: speed assist sets lane speed to 70% and the timer to 45 seconds; the setting can only change between games (FR-050)
- [X] T070 [P] [US5] Write `tests/unit/contrast.test.ts`: every UI text token in `src/render/palette.ts` meets 4.5:1 against its background (FR-052)
- [ ] T071 [US5] Write `tests/e2e/keyboard.spec.ts` in the desktop project: a full game from title through game over and initials entry using only the keyboard, with a visible focus ring on every control (AC-9, FR-38). This test is completed in US6 after initials entry exists. Depends on T074, T087.

### Implementation for User Story 5

- [X] T072 [US5] Implement `src/ui/focus.ts`: a visible focus ring and arrow-key navigation across menu items (FR-038)
- [X] T073 [US5] Update `src/ui/title.ts`, `src/ui/pauseMenu.ts`, and `src/ui/gameOver.ts` to use keyboard focus navigation with Enter, Space, and Esc (FR-030, FR-038). Depends on T072.
- [X] T074 [US5] Apply speed assist at game start only in `src/core/levels.ts` and `src/core/lifeTimer.ts` (FR-050). Depends on T056, T031.
- [X] T075 [US5] Implement `src/render/palette.ts`: color tokens plus a shape and outline pattern for each object type, and UI text colors checked for contrast (FR-049, FR-052)
- [X] T076 [US5] Implement `scripts/check-contrast.ts`: a script that checks the palette tokens for WCAG 2.2 AA contrast and records the color-blindness simulation results to `docs/accessibility.md` (research R7, FR-049)

**Checkpoint**: At this point, the game is playable with the keyboard alone and passes the palette checks.

---

## Phase 8: User Story 6 - Save High Scores and Settings on the Device (Priority: P3)

**Goal**: Qualifying scores are saved with initials and shown in a top-10 table. Settings persist. Music plays on title and gameplay. Blocked storage shows a notice.

**Independent Test**: Finish a game with a qualifying score, enter initials, reload the page, and confirm the entry remains. Block storage and confirm the game still plays with the notice.

### Tests for User Story 6

- [X] T077 [P] [US6] Write `tests/unit/highscores.test.ts`: the table keeps the top 10 sorted by score; a score qualifies only if it beats the lowest entry or the table has fewer than 10 entries; initials are three letters A to Z; the assist flag is stored (FR-024, FR-039, FR-040)
- [X] T078 [P] [US6] Write `tests/unit/storeFallback.test.ts`: a blocked or full store returns defaults without throwing and sets the notice flag (FR-042)

### Implementation for User Story 6

- [X] T079 [P] [US6] Implement `src/storage/highscores.ts`: read and write `hop.highScores.v1` per `contracts/storage.md`, with the last-save-wins rule (FR-039, clarified 2026-11-12)
- [X] T080 [P] [US6] Implement `src/storage/settings.ts`: read and write `hop.settings.v1` with defaults from `data-model.md` (FR-041)
- [X] T081 [US6] Implement `src/ui/initials.ts`: three-letter entry by keyboard and by touch, A to Z only (FR-024). Depends on T079.
- [X] T082 [US6] Update `src/ui/gameOver.ts` to ask for initials when the score qualifies (FR-024). Depends on T081.
- [X] T083 [US6] Implement `src/ui/highScores.ts`: the top-10 table with score, level reached, date, and the assist marker (FR-039, FR-040). Depends on T079.
- [X] T084 [US6] Implement `src/ui/settings.ts`: music volume, effects volume, mute, speed assist (changeable only between games), haptics, and reset high scores with a confirmation step (FR-037, FR-050). Depends on T080.
- [X] T085 [US6] Implement `src/audio/music.ts`: looped background music for title and gameplay with no audible gap (FR-044)
- [X] T086 [US6] Update `src/audio/audio.ts` to apply the volume and mute settings and to play the menu-action sounds (FR-037, FR-043). Depends on T080.
- [X] T087 [US6] Implement `src/ui/notice.ts`: the one-time "Scores will not be saved on this device" notice shown when storage fails (FR-042). Depends on T018.

**Checkpoint**: At this point, high scores, settings, and music all persist and work with blocked storage.

---

## Phase 9: User Story 7 - Install the Game and Play Offline (Priority: P3)

**Goal**: After one online visit, the game installs as a PWA and plays fully offline. Updates are offered on the title or pause screen and never during a game.

**Independent Test**: Visit the game online, install it, switch to airplane mode, launch the installed copy, and play a full game.

### Tests for User Story 7

- [X] T088 [US7] Write `tests/e2e/offline.spec.ts`: load once online, go offline in the browser context, reload, and play a full game (AC-8, FR-054). Depends on T090, T091.

### Implementation for User Story 7

- [X] T089 [P] [US7] Configure the PWA plugin in `vite.config.ts`: the web app manifest (name, icons including maskable, theme color, portrait orientation) and build-time precache of all assets (FR-053, FR-054, research R4)
- [X] T090 [P] [US7] Create the original icon set in `public/icons/`: 192 px, 512 px, and a 512 px maskable icon. Use original art only (FR-046).
- [X] T091 [US7] Implement `src/pwa/update.ts`: show a small update prompt on the title or pause screen when a new service worker is waiting. Reload only when the player agrees. Never show it during a game (FR-055). Depends on T089.
- [X] T092 [US7] Implement `src/pwa/install.ts`: an install prompt on Chrome and Edge, and Add to Home Screen instructions on iOS Safari (FR-056)
- [X] T093 [US7] Register the service worker from `src/main.ts` and connect `src/pwa/update.ts` to the registration. Depends on T089, T091.

**Checkpoint**: At this point, the game installs and runs offline.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Release readiness and checks that span stories

- [X] T094 [P] Write `README.md` at repo root covering setup, build, test, and deploy (NFR-010)
- [X] T095 [P] Finalize `public/ATTRIBUTIONS.md` for every licensed asset, or confirm there are none (Principle V)
- [X] T096 [P] Add `.github/workflows/deploy.yml` to build and deploy to GitHub Pages over HTTPS, with the Vite base path set for the repo (NFR-012)
- [X] T097 Search the repo, built output, manifest, and page metadata for "Frogger" and Konami names, and confirm no matches (AC-11)
- [X] T098 Run `npm run build` and confirm the first-load download is under 3 MB, including art and audio (NFR-005, quickstart.md size budget)
- [ ] T099 Run the frame-rate check from research R2 on the iPhone SE (3rd generation) and one current desktop browser at level 12 for 60 seconds (AC-7)
- [ ] T100 Run the device and browser pass on one iPhone, one Android phone, and current Chrome, Firefox, and Safari on desktop. Record results in the release notes (NFR-011, AC-12)
- [ ] T101 Run every step in `quickstart.md` and record the results. Fix any failed check before release.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **User Stories (Phases 3 to 9)**: All depend on Foundational.
  - US1 (P1) and US2 (P1) are the core loop. US2 builds on US1's frog and collision code, so do US1 first.
  - US3 (P2) and US4 (P2) can start after US1, and US5 (P2) can start after US3 because speed assist touches level code.
  - US6 (P3) and US7 (P3) can start after US2.
- **Polish (Phase N)**: Depends on the stories you ship.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational. No story dependencies.
- **US2 (P1)**: Starts after US1, since it extends the frog and collision code.
- **US3 (P2)**: Starts after US2, since scoring depends on bays and level clear.
- **US4 (P2)**: Starts after US1. Touch input uses the hop actions from US1.
- **US5 (P2)**: Starts after US3. Speed assist depends on the level code.
- **US6 (P3)**: Starts after US3 (game over and scoring) and US5 (keyboard focus).
- **US7 (P3)**: Starts after US4 (touch flow) and US6 (settings and update prompts).

### Within Each User Story

- Tests are written first and must fail before implementation.
- Core types and logic come before rendering and UI.
- Logic comes before the story's end-to-end test.

### Parallel Opportunities

- Setup tasks marked [P] can run together.
- Foundational config files (T011 to T013) and core utilities (T015 to T017, T021, T023) can run together.
- Within a story, tasks marked [P] touch different files and can run together.
- Once Foundational is done, US1 and US4 are the first candidates to run in parallel with different developers.

---

## Parallel Example: User Story 2

```bash
# Tests together (required by NFR-011):
Task: "Write tests/unit/turtles.test.ts"
Task: "Write tests/unit/river.test.ts"
Task: "Write tests/unit/bays.test.ts"

# Independent core modules together:
Task: "Implement src/core/turtles.ts"
Task: "Implement src/core/bays.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Cross the road, lose a life on contact, and lose a life on timeout
5. Demo if ready

### Incremental Delivery

1. Setup and Foundational: foundation ready
2. US1 and US2: a full level can be cleared (first playable)
3. US3: score and progression
4. US4 and US5: phone play and keyboard accessibility
5. US6 and US7: saves, settings, music, and offline install
6. Polish: release checks

### Notes

- [P] tasks touch different files and have no dependencies on incomplete tasks
- [Story] labels map each task to a user story for traceability
- Each story has a checkpoint where it can be tested on its own
- Commit after each task or logical group
- Test tasks are required by NFR-011 and the constitution's quality gates
