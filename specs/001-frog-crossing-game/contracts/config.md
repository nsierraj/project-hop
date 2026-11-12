# Contract: Tuning Configuration

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

This is the contract for the JSON files in `src/config/`. The game is the only consumer. The
contract is internal, but it is written down because tuning (FR-29, NFR-010) depends on it and
tests substitute values through it.

## Files

| File | Holds | Requirements |
|------|-------|--------------|
| `game.json` | Lives, life timer, bonus-life threshold, points, swipe threshold, speed assist values | FR-020, FR-021, FR-025 to FR-028, FR-031, FR-050 |
| `levels.json` | Per-level curves and the cap level | FR-019, FR-023 |
| `layout.json` | Row layout and lane definitions | FR-002, FR-004 |

## `game.json`

```json
{
  "lives": { "start": 3, "max": 5 },
  "bonusLife": { "scoreThreshold": 10000 },
  "lifeTimerSeconds": 30,
  "warningSeconds": 5,
  "points": {
    "forwardHop": 10,
    "bayReached": 50,
    "timeBonusPerSecond": 10,
    "levelCleared": 1000
  },
  "hop": { "durationMs": 120, "bufferSize": 1 },
  "swipe": { "minDistanceCssPx": 24, "maxDurationMs": 400 },
  "dive": { "surfacedMs": 3000, "sinkingMs": 1000, "submergedMs": 2000, "risingMs": 800 },
  "divingSinkWarningMs": 750,
  "speedAssist": { "laneSpeedFactor": 0.7, "lifeTimerSeconds": 45 },
  "highScores": { "maxEntries": 10, "initialsLength": 3 },
  "levelClearCelebrationMs": 2000,
  "deathAnimationMs": 500
}
```

| Key | Type | Constraint |
|-----|------|------------|
| `lives.start` | integer | 1 to `lives.max` |
| `lives.max` | integer | 1 to 9. The spec sets 5. |
| `bonusLife.scoreThreshold` | integer | >= 0 |
| `lifeTimerSeconds` | number | > `warningSeconds` |
| `warningSeconds` | number | > 0 |
| `points.*` | integer | >= 0 |
| `hop.durationMs` | integer | 60 to 200 |
| `hop.bufferSize` | integer | Must be 1 (FR-6) |
| `swipe.minDistanceCssPx` | number | 16 to 40 |
| `swipe.maxDurationMs` | integer | > 0 |
| `divingSinkWarningMs` | integer | >= 750 (FR-18) |
| `speedAssist.laneSpeedFactor` | number | 0.5 to 1.0. The spec sets 0.7. |
| `speedAssist.lifeTimerSeconds` | number | >= `lifeTimerSeconds`. The spec sets 45. |
| `highScores.maxEntries` | integer | Must be 10 (FR-39) |
| `highScores.initialsLength` | integer | Must be 3 (FR-24) |
| `dive.*Ms` | integer | Each >= 1. `sinkingMs` must be >= `divingSinkWarningMs`. |
| `levelClearCelebrationMs`, `deathAnimationMs` | number | >= 0 |

## `levels.json`

```json
{
  "capLevel": 12,
  "baseObjectsPerLane": 3,
  "laneSpeedTilesPerSecond": { "river": 1.2, "road": 1.6 },
  "speedIncreasePerLevel": 0.08,
  "densityIncreasePerLevel": 0.05,
  "divingShareStart": 0.0,
  "divingShareIncreasePerLevel": 0.06,
  "logLengthStartTiles": 4,
  "logLengthMinTiles": 2
}
```

| Key | Type | Constraint |
|-----|------|------------|
| `capLevel` | integer | >= 1. The spec sets 12 (FR-23). |
| `baseObjectsPerLane` | integer | >= 1. Objects per lane at level 1, before density scaling. |
| `laneSpeedTilesPerSecond.*` | number | > 0. Base speeds are placeholders until playtests (BRD OI-4). |
| `*IncreasePerLevel` | number | >= 0 |
| `divingShareStart`, `divingShareIncreasePerLevel` | number | 0 to 1 |
| `logLengthStartTiles`, `logLengthMinTiles` | integer | `logLengthMinTiles` >= 1 and <= `logLengthStartTiles` |

Every curve uses `effectiveLevel = min(level, capLevel)`, so no value keeps rising past the cap
(AC-4).

## `layout.json`

Defines the rows, top to bottom, and the lanes in them. The row order is fixed by FR-2 and is
checked at load time.

```json
{
  "grid": { "columns": 13, "rows": 13 },
  "rows": [
    { "name": "home", "kind": "home" },
    { "name": "river-1", "kind": "river", "direction": "right", "spawn": "log" },
    { "name": "river-2", "kind": "river", "direction": "left", "spawn": "turtle" },
    { "name": "river-3", "kind": "river", "direction": "right", "spawn": "log" },
    { "name": "river-4", "kind": "river", "direction": "left", "spawn": "log" },
    { "name": "river-5", "kind": "river", "direction": "right", "spawn": "turtle" },
    { "name": "median", "kind": "median" },
    { "name": "road-1", "kind": "road", "direction": "left", "spawn": "vehicle" },
    { "name": "road-2", "kind": "road", "direction": "right", "spawn": "vehicle" },
    { "name": "road-3", "kind": "road", "direction": "left", "spawn": "vehicle" },
    { "name": "road-4", "kind": "road", "direction": "right", "spawn": "vehicle" },
    { "name": "road-5", "kind": "road", "direction": "left", "spawn": "vehicle" },
    { "name": "bank", "kind": "bank" }
  ]
}
```

| Rule | Source |
|------|--------|
| Exactly 13 rows in this order: home, 5 river, median, 5 road, bank. | FR-2 |
| Exactly 5 river rows and 5 road rows. | FR-2 |
| Columns = 13. | FR-1 |
| Each lane has `direction` and `spawn` from the allowed set. | FR-4 |

The example directions and spawn kinds above are placeholders. The arrangement shown is one
valid layout.

## Loading and validation

1. `loader.ts` imports each JSON file once at startup.
2. Each file is checked against the constraints above. Failed checks throw an error that names the
   file and key.
3. The Vite build imports the same files and runs the same check, so a bad file fails the build.
4. Tests can build a config object in code and pass it to the core, bypassing the files.
