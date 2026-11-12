# Project Hop

A browser road-and-river crossing game. Guide a frog across five lanes of traffic and a river of
logs and diving turtles, then fill all five home bays to clear the level. Each level is faster and
busier, up to a cap.

Project Hop is a static, offline-capable Progressive Web App. It has no server, no accounts,
no cookies, and no analytics. Scores and settings stay on your device.

## Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Hop | Arrow keys or WASD | Swipe in any direction |
| Hop forward | Arrow up or W | Tap the playfield |
| Pause | P or Esc | (leave the page to pause) |
| Menus | Arrow keys to move, Enter or Space to choose | Tap |

## Setup

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173
```

Add `?debug` to the URL to show the frame-timing overlay.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, phone and desktop projects) |
| `npm run lint` | ESLint |
| `npm run contrast` | WCAG contrast check for UI text |

First-time end-to-end setup: `npx playwright install chromium webkit`.

## Project layout

- `src/core/` game rules as a fixed-step simulation. No DOM or Canvas code.
- `src/config/` tuning files (`game.json`, `levels.json`, `layout.json`) and their validator.
- `src/render/` Canvas drawing, palette, and HUD.
- `src/input/` keyboard and touch input.
- `src/audio/` synthesised sound effects and music, and haptics.
- `src/ui/` DOM menus and screens.
- `src/storage/` safe `localStorage` wrapper, high scores, and settings.
- `src/pwa/` service worker updates and install prompts.
- `tests/unit/` logic tests. `tests/e2e/` browser tests.

The design is in [specs/001-frog-crossing-game](specs/001-frog-crossing-game/). Start with
`spec.md`, then `plan.md`, `contracts/`, and `quickstart.md`.

## Tuning

All point values, timers, lane speeds, level curves, and the cap level live in `src/config/`.
Change the numbers there. Code changes are not needed. The build fails if a value is out of range.

## Deploy

Pushes to `main` build and publish `dist/` to GitHub Pages through
`.github/workflows/deploy.yml`. Enable Pages in the repository settings with the source set to
GitHub Actions.

## Release checklist

Before each release, run the manual device pass in
[quickstart.md](specs/001-frog-crossing-game/quickstart.md) on an iPhone, an Android phone, and
desktop Chrome, Firefox, and Safari. Record the results in the release notes.
