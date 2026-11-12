# Data Model: Frog Crossing Game (v1)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

The game has no server data. Runtime state lives in memory during a session. Only the top-10
table and settings are saved, in browser storage (see [contracts/storage.md](./contracts/storage.md)).
Tile coordinates use the 13 by 13 grid from FR-001, with row 0 as the home row and row 12 as the
start bank. Columns run 0 to 12.

## Runtime entities

### GameState

The root state the logic loop advances.

| Field | Type | Notes |
|-------|------|-------|
| `mode` | enum: `title`, `playing`, `paused`, `levelClear`, `gameOver`, `highScores`, `settings` | FR-035 |
| `seed` | integer | Seeds the RNG. Set at game start. |
| `tick` | integer | Logic step counter, incremented each 60 Hz step. |
| `level` | integer, >= 1 | Current level number (FR-023). |
| `score` | integer, >= 0 | Points earned this game. |
| `lives` | integer, 0 to 5 | Starts at 3 (FR-020). |
| `bonusLifeAwarded` | boolean | Set once when the score first reaches the threshold. |
| `assisted` | boolean | True if speed assist was on when the game started (FR-050). |
| `bays` | Bay[5] | Home bay state (FR-022). |
| `frog` | Frog | Current frog (FR-005). |
| `lanes` | Lane[11] | Ordered top to bottom: 5 river lanes, 1 median, 5 road lanes. The bank and bay rows are not lanes. |

**State transitions**:
- `title` → `playing`: on start input (FR-30, FR-31).
- `playing` → `paused`: on pause input or when the page is hidden (FR-36).
- `paused` → `playing`: on resume input.
- `playing` → `levelClear`: when all 5 bays are filled (FR-22).
- `levelClear` → `playing`: after the celebration, with a new level and empty bays.
- `playing` → `gameOver`: when `lives` reaches 0 (FR-24).
- `gameOver` → `highScores` or `title`: depends on whether the score qualifies (FR-24, FR-39).

### Frog

| Field | Type | Validation / rule |
|-------|------|-------------------|
| `row`, `col` | integer | Must stay inside the grid. Cannot go below row 12 or past col 0 or col 12 (FR-7). |
| `hop` | HopState or null | Set while a hop animates (about 120 ms, FR-5). Direction cannot change mid-hop. |
| `buffered` | Direction or null | One pending hop (FR-6). Further inputs are dropped. |
| `riding` | reference to a Lane object, or null | Set while on a log or turtle group (FR-8). |
| `maxRowReached` | integer | Lowest row reached during this life. Used for forward-hop points (FR-25). |
| `timerMs` | integer, 0 to life duration | Countdown for this life (FR-21). |

### Lane

| Field | Type | Rule |
|-------|------|------|
| `index` | integer | Position in the `lanes` array. |
| `kind` | enum: `river`, `median`, `road` | Determines hazard rules. |
| `direction` | enum: `left`, `right` | From `layout.json` (FR-4). |
| `speed` | number, tiles per second | Base from config, scaled by level and speed assist (FR-23, FR-50). |
| `objects` | LaneObject[] | Vehicles, logs, or turtle groups currently in the lane. |
| `spawn` | SpawnPattern | Config-defined spacing and length ranges. Keeps lanes from running empty (FR-4). |

### LaneObject

Used for road vehicles, logs, and turtle groups. Kind is set by the lane.

| Field | Type | Rule |
|-------|------|------|
| `kind` | enum: `vehicle`, `log`, `turtleGroup` | Matches the lane kind. |
| `x` | number, in tiles | Position. Wraps or respawns off-screen. |
| `length` | integer, in tiles | Vehicles vary in length (FR-9). Logs shorten with level (FR-23). |
| `turtleCount` | integer, 2 or 3 | Only for turtle groups (FR-16). |
| `diveState` | enum: `surfaced`, `sinking`, `submerged`, `rising` | Only for diving groups. Null for non-diving groups. |
| `diveTimerMs` | integer | Time in the current dive state. Sinking lasts at least 750 ms at base speed (FR-18). |
| `diving` | boolean | Set on some groups by level (FR-19). |

**Turtle dive cycle**: `surfaced` → `sinking` → `submerged` → `rising` → `surfaced`. A frog on
`submerged` drowns (FR-17). A frog on `sinking` or `rising` is safe.

### Bay

| Field | Type | Rule |
|-------|------|------|
| `index` | integer, 0 to 4 | Fixed position on the home row. |
| `filled` | boolean | Stays filled until the level clears (FR-15, FR-22). |

### Level

Level values are not stored as separate records. They come from config and the level number
(`levels.json`, see [contracts/config.md](./contracts/config.md)).

| Derived value | Rule |
|---------------|------|
| `laneSpeedFactor` | Rises with level until the cap level (FR-23). |
| `density` | Rises with level until the cap level. |
| `divingShare` | Rises with level until the cap level (FR-19). |
| `logLengthScale` | Falls with level until the cap level (FR-23). |
| `effectiveLevel` | `min(level, capLevel)`. All curves use this value, so difficulty stops rising at the cap (AC-4). |

### Score

| Event | Points | Source |
|-------|--------|--------|
| Forward hop to a new row this life | 10 | FR-25 |
| Frog reaches a bay | 50 | FR-26 |
| Time bonus at a bay | 10 per full second left | FR-27 |
| Level cleared | 1000 | FR-28 |
| Bonus life threshold reached | 0 (grants one life) | FR-20 |

Speed assist does not change points (clarified 2026-11-12). Assisted games are marked in the table.

## Persisted entities

### HighScoreEntry

Stored in the top-10 table. Max 10 entries, sorted by score descending.

| Field | Type | Validation |
|-------|------|------------|
| `initials` | string, exactly 3 characters | Letters A to Z (FR-24). |
| `score` | integer, >= 0 | |
| `levelReached` | integer, >= 1 | |
| `date` | string, ISO 8601 date | |
| `assisted` | boolean | Shows an assist marker in the table (FR-40). |

A score qualifies if it is higher than the lowest entry or the table has fewer than 10 entries.

### Settings

| Field | Type | Default | Rule |
|-------|------|---------|------|
| `musicVolume` | number, 0 to 1 | 0.7 | FR-37 |
| `effectsVolume` | number, 0 to 1 | 0.8 | FR-37 |
| `muted` | boolean | false | FR-37 |
| `speedAssist` | boolean | false | Applied at game start only (FR-50) |
| `haptics` | boolean | true | Only has an effect where supported (FR-33) |

Defaults are placeholders until playtesting. They are set in config, not code.

## Validation summary

- Frog position is checked on every step: below the start bank or outside columns 0 to 12 is
  rejected (FR-7).
- Bays only fill from the home row. Landing on a wall or filled bay kills the frog (FR-12).
- Lives stay within 0 to 5 (FR-20).
- Configured values are checked once at startup against [contracts/config.md](./contracts/config.md).
  Invalid config stops startup with a clear error. The build fails if a config file does not
  validate, so an invalid config never ships.
