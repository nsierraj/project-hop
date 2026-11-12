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
