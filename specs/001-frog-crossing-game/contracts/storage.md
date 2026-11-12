# Contract: Browser Storage

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

This contract covers everything the game writes to `localStorage`. Nothing else is saved, and
nothing is sent off the device (NFR-007).

## Keys

| Key | Contents | Requirements |
|-----|----------|--------------|
| `hop.highScores.v1` | JSON array of HighScoreEntry, max 10 | FR-039, FR-040 |
| `hop.settings.v1` | JSON object of Settings | FR-041 |
| `hop.hintSeen.v1` | `"1"` once the control hint has been shown | FR-034 |

The `.v1` suffix is a schema version. A future change adds `.v2` and migrates from `.v1`. It does
not overwrite the old key until migration succeeds.

## Shapes

### `hop.highScores.v1`

```json
[
  { "initials": "ABC", "score": 12450, "levelReached": 4, "date": "2026-11-12", "assisted": false }
]
```

- Array of at most 10 entries, sorted by `score` descending.
- `initials`: exactly 3 characters, A to Z.
- `score`: integer, >= 0.
- `levelReached`: integer, >= 1.
- `date`: ISO 8601 date (`YYYY-MM-DD`).
- `assisted`: boolean.

### `hop.settings.v1`

```json
{ "musicVolume": 0.7, "effectsVolume": 0.8, "muted": false, "speedAssist": false, "haptics": true }
```

- Volumes are numbers from 0 to 1.
- Missing keys take the defaults in the data model.
- Unknown keys are dropped on the next write.

## Read and write rules

1. Every read and write goes through `store.ts`, which wraps `localStorage` in try/catch.
2. A read that fails or returns malformed JSON returns the default value and does not throw.
3. A write that fails switches the store to in-memory mode for the rest of the session. The game
   then shows the FR-042 notice once: "Scores will not be saved on this device."
4. Writes happen only at these points: a high score is accepted, the player changes a setting, or
   the control hint is dismissed. Frame updates never write.
5. Each high-score save writes the table as this tab last loaded or saved it. Entries saved by
   another open tab since then are overwritten. The last save wins (clarified 2026-11-12), and
   entries are not merged across tabs.

## Reset

Resetting high scores (FR-037) removes `hop.highScores.v1` after a confirmation step. Settings are
not affected by that reset.
