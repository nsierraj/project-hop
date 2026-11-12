# Release Notes

## Device checks

Results from the manual passes in `specs/001-frog-crossing-game/quickstart.md`.

### T099: Frame rate at level 12 (AC-7)

Run at `https://nsierraj.github.io/project-hop/?debug&level=12`, 60 seconds of play.

| Device | Browser | Average fps | Frame time | Dropped frames | Result |
|--------|---------|-------------|------------|----------------|--------|
| iPhone SE (3rd generation) | Safari | 60.0 | 16.7 ms | 3 | Pass |
| Desktop | (browser not recorded) | 60.0 | 16.7 ms | 0 | Pass |

T099 is complete: both readings meet the 55 fps threshold.

### T100: Device and browser pass (NFR-011, AC-12)

| Device | Browser | Load and start | Play and hop | Pause | Menus and settings | Score entry | Install | Offline | Vibration | Result |
|--------|---------|----------------|--------------|-------|--------------------|-------------|---------|---------|-----------|--------|
| iPhone SE (3rd generation) | Safari | Pass | Pass | Pass | Pass | Pass | Pass | Pass | n/a (iOS) | Pass |
| iPhone (other) | Safari | Pass | Pass | Pass | Pass | Pass | Pass | Pass | n/a (iOS) | Pass |
| Android phone | Chrome | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Desktop | Chrome | Pass | Pass | Pass | Pass | Pass | Pass | Pass | n/a | Pass |
| Desktop | Firefox | Pass | Pass | Pass | Pass | Pass | Pass | Pass | n/a | Pass |
| Desktop | Safari | Pass | Pass | Pass | Pass | Pass | Pass | Pass | n/a | Pass |

Per-step results were reported as a single overall pass by the owner on 2026-11-12. Per-step detail was not recorded.

Automated proxies (headless browsers, not hardware): end-to-end tests pass in Chromium, Firefox,
and WebKit, and the frame-rate check passes at 60 fps or higher in all four projects.

## Quickstart run (T101)

Run on 2026-11-12 from a clean install (`npm ci`), following
`specs/001-frog-crossing-game/quickstart.md`.

| Step | Result |
|------|--------|
| Clean install | Pass |
| Dev server responds | Pass (HTTP 200) |
| Unit tests (`npm test`) | Pass, 58 tests |
| Lint and type-check | Pass |
| Contrast check (`npm run contrast`) | Pass, 4 pairs at 4.5:1 or more |
| Colour-blindness check (`npm run colorblind`) | Pass, 11 pairs at Delta E 10 or more |
| Production build | Pass |
| Shipped size | 69.3 KB against a 3072 KB budget |
| Naming check (no Frogger or Konami) | Pass |
| End-to-end suite (`npm run test:e2e`) | Pass, 33 passed, 15 skipped by project design |
| Load budget on throttled 4G | Pass, first visit 424 ms (budget 3000), repeat 22 ms (budget 1000) |
| Frame rate at level 12 (automated proxy) | Pass, 60 fps or more in all four browser projects |
| Device frame rate and browser pass (AC-7, AC-12) | Pass, recorded above |

The 15 skipped tests are the phone-only touch tests on desktop projects, and the load test on
non-Chromium browsers, which uses the Chrome DevTools protocol.

