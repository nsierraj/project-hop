<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: none (initial ratification from template placeholders)
- Added principles:
  - I. Deterministic Fixed-Timestep Simulation
  - II. Configuration Over Constants
  - III. Accessible by Default
  - IV. Private, Static, and Offline-First
  - V. Original Work Only
- Added sections: Platform and Performance Constraints; Development Workflow and Quality Gates
- Removed sections: none
- Templates requiring updates: none checked against this version; dependent
  templates read this file at runtime
- Source of content: brd.md (Project Hop BRD v0.1, dated 2026-11-12)
- Follow-up TODOs:
  - TODO(TECH_STACK): OI-2 in brd.md is open (vanilla JS + Canvas, framework, or engine).
    Principles above are stack-neutral; add stack rules once chosen.
  - TODO(REFERENCE_DEVICE): the "mid-range phone from 2022 or later" reference device in
    NFR-2 and AC-7 is not named. Pick a concrete model before the performance gate applies.
-->

# Project Hop Constitution

## Core Principles

### I. Deterministic Fixed-Timestep Simulation

Game logic MUST run on a fixed timestep, independent of display refresh rate. Given the same
seed and the same input sequence, the simulation MUST produce the same state. Rendering MAY
interpolate between steps but MUST NOT change outcomes. Collision, scoring, level progression,
and turtle dive cycles MUST be pure logic that runs headless so automated tests can drive it
without a browser.

**Rationale**: Equal play on 60, 120, and 144 Hz screens (NFR-3) and reliable automated tests
(NFR-11, AC-5) both depend on separating logic from rendering.

### II. Configuration Over Constants

Lane layouts, lane speeds, level curves, the level cap, timer lengths, bonus-life thresholds,
and every point value MUST live in configuration files, not in logic. Tuning MUST NOT require
code changes. Code MUST read these values through one loader so tests can substitute them.

**Rationale**: Final tuning values are open (OI-4) and will be set after playtests (R-3).
Config-driven tuning is how the difficulty curve gets fixed without rewrites.

### III. Accessible by Default

Every feature MUST be operable with the keyboard alone, with a visible focus indicator (FR-38,
AC-9). Hazards and game objects MUST be distinguishable by shape, outline, or pattern, not hue
alone, and MUST remain distinguishable under protanopia, deuteranopia, and tritanopia simulation
(FR-49, AC-10). UI text MUST meet WCAG 2.2 AA contrast. Speed assist MUST remain available
(FR-50).

**Rationale**: Accessibility is a stated business objective (BO-4), not a later polish pass.
Retrofitting shape cues and focus handling into a finished palette and layout costs more.

### IV. Private, Static, and Offline-First

The shipped game MUST be static files served from GitHub Pages. It MUST NOT include server
code, a database, cookies, analytics, tracking, or third-party scripts (NFR-8, constraints).
All player data (settings, top-10 table) MUST stay on the device in browser storage. If storage
is blocked or full, the game MUST still play and MUST tell the player that scores will not be
saved (FR-42). After the first load, the game MUST launch and play a full session with no
network (FR-54, AC-8). Updates MUST NOT interrupt a game in progress (FR-55).

**Rationale**: The hosting constraint and the privacy promise are what let a portfolio game
run for free with no backend to maintain. Offline play is a stated objective (BO-3).

### V. Original Work Only

All art, sound effects, music, fonts, names, and layouts MUST be original or licensed for this
use with attribution recorded in the repository (FR-46, OI-3). The name "Frogger" and any
Konami-owned name, art, music, or trade dress MUST NOT appear in the game, repository name,
page title, manifest, or metadata (AC-11). Reference material MAY be studied, but no assets or
visual specifics may be copied.

**Rationale**: Trademark and trade-dress risk is rated High impact (R-1). Keeping the rule
absolute avoids case-by-case judgment calls.

## Platform and Performance Constraints

- **Browsers**: The latest two major versions of Chrome, Edge, Firefox, and Safari on desktop;
  Safari on iOS; and Chrome on Android (NFR-1). Features unsupported on a target browser MUST
  degrade gracefully. Example: haptics are Android-only because iOS lacks the Vibration API.
- **Frame rate and latency**: The game MUST hold 60 fps on the reference mid-range phone at
  level 12 and on current desktops (NFR-2, AC-7). Input-to-hop latency MUST be under 50 ms
  (NFR-4).
- **Size and load**: The full download, including art and audio, MUST be under 3 MB (NFR-5).
  The game MUST be playable within 3 s on a 4G connection on first visit and under 1 s on
  repeat visits (NFR-6).
- **Layout**: The game MUST work from 360 px wide phones up to 4K monitors and MUST respect
  safe-area insets on notched phones (NFR-7). Mobile play is portrait-only; landscape shows a
  rotate-device screen and pauses (FR-48).
- **Audio**: Audio MUST NOT start before the first user interaction (FR-45).
- **Pixel art**: Pixel art MUST be scaled by whole-number multiples with smoothing off where
  the screen allows (FR-47).

## Development Workflow and Quality Gates

- **Scope**: v1 scope is the list in brd.md section 3.1. Items in section 3.2 and section 11
  MUST NOT be built until a spec for them is approved. Scope additions MUST be recorded in the
  BRD first.
- **Tests**: Automated tests MUST cover collision, scoring (AC-5), level progression, and
  turtle dive cycles (NFR-11). A change to any of these areas MUST NOT merge with failing or
  missing tests for that area.
- **Device pass**: Before each release, the game MUST pass a manual test on at least one
  iPhone, one Android phone, and three desktop browsers (NFR-11, AC-12). Release notes MUST
  record which devices and browsers were tested.
- **Phase exit checks**: Work proceeds through the six phases in brd.md section 10. A phase is
  done only when its exit check passes.
- **Documentation**: The README MUST cover setup, build, test, and deploy (NFR-10).
- **Solo maintenance**: The project is built by one person (brd.md section 7). Review
  checklists MUST be short enough to run alone.

## Governance

This constitution supersedes other practices in this repository, including ad-hoc decisions
recorded only in chat or commit messages. Requirements in the constitution take precedence over
the BRD where they conflict. The BRD then needs an update to match.

**Amendments**: An amendment MUST be written as a change to this file, with a Sync Impact
Report at the top and a rationale for the version bump. Amendments MUST be committed in their
own commit. Removing or redefining a principle requires a note explaining what changes for
existing code and tests.

**Versioning**: The constitution follows semantic versioning.
- MAJOR: a principle is removed or redefined in a way that makes existing work non-compliant.
- MINOR: a principle or section is added, or existing guidance is materially expanded.
- PATCH: wording, typo, or clarification changes that do not change compliance.

**Compliance review**: Every spec, plan, and task list MUST state how it complies with the
Core Principles. Any deliberate exception MUST be recorded in the plan's complexity or
justification section with its reason. Each release MUST be checked against the Platform and
Performance Constraints and the Quality Gates before it ships.

**Version**: 1.0.0 | **Ratified**: 2026-11-12 | **Last Amended**: 2026-11-12
