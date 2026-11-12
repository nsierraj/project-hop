# Quickstart: Validating Frog Crossing Game (v1)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This guide lists the commands to run and the checks that prove the feature works end to end. It
does not repeat requirements; follow the links for details.

## Prerequisites

- Node.js LTS and npm installed.
- Repository cloned from `https://github.com/nsierraj/project-hop`.
- For the device pass: an iPhone SE (3rd generation), an Android phone, and three desktop browsers
  (NFR-011).

## Setup

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
```

## Automated checks

| Command | Checks | Expected |
|---------|--------|----------|
| `npm test` | Unit tests for collision, scoring, level progression, dive cycles, config loader, storage fallback | All pass. Covers AC-2, AC-3, AC-5 and NFR-011. |
| `npm run test:e2e` | Playwright runs: keyboard-only full game, touch gestures at 390 x 844, offline launch after one visit | All pass. Covers AC-8 and AC-9. |
| `npm run build` | Config validation, production build, precache manifest | Build succeeds. Output is under 3 MB (NFR-005). |
| `npm run preview` | Serves the built output | Game loads from the built files. |

## Size and load budget

After `npm run build`:

1. Total size of `dist/` for first-load assets is under 3 MB (NFR-005).
2. Serve `dist/` over a throttled 4G profile. The title screen is playable within 3 seconds on
   first visit and within 1 second on repeat visits (NFR-006).

## Manual checks

Each check maps to an acceptance criterion in the spec.

1. **Start in one step (AC-1)**: Open the game URL. Start a game with one key press or one tap.
2. **Death causes (AC-2)**: In a debug build with a fixed seed, trigger each of the five death
   causes in FR-009 to FR-013. Each costs exactly one life.
3. **Diving turtles (AC-3)**: Stand on a submerged group and drown. Stand on a sinking or rising
   group and survive.
4. **Level progression (AC-4)**: Fill all five bays. The next level is faster. Check that speeds
   stop rising at level 12.
5. **High scores (AC-6)**: Finish a game with a qualifying score. Enter initials. Reload. The entry
   stays and an assisted score shows the marker.
6. **Frame rate (AC-7)**: On the iPhone SE, play to level 12 and check the debug overlay for
   60 fps over 60 seconds. Repeat on one current desktop browser. See research.md R2.
7. **Offline (AC-8)**: Visit once online and install the app. Switch to airplane mode. Launch the
   installed app and play a full game.
8. **Keyboard only (AC-9)**: Play a full game, including initials entry, with the keyboard alone
   and no pointer.
9. **Color-blind (AC-10)**: Use the color-blindness simulation tool on each screen. Confirm
   vehicles, logs, turtles, water, and safe zones differ in shape or pattern.
10. **Naming (AC-11)**: Search the built output, manifest, and page metadata for "Frogger" and
    confirm no matches.
11. **Device and browser pass (AC-12)**: Run the full game on the iPhone SE, one Android phone,
    and current Chrome, Firefox, and Safari on desktop. Record results in the release notes.

## Storage fallback

1. In a private window, or after blocking site data, start the game.
2. The game plays normally and shows the FR-042 notice before the first score is saved.

## Troubleshooting

- **Config error at startup**: The message names the file and key. Fix the value in
  `src/config/` (see [contracts/config.md](./contracts/config.md)).
- **Service worker does not update**: Hard reload, then check the update prompt on the title
  screen (FR-055). Updates never appear during a game.
- **Touch does not hop**: Check the swipe threshold in `game.json` (minimum 24 CSS px by default).
