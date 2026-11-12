# Feature Specification: Frog Crossing Game (v1)

**Feature Branch**: Not created (work is on `main`)

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "read the brd.md document for the specifications"

**Source**: `brd.md` (Project Hop BRD, version 0.1). Requirement IDs in parentheses (FR-, NFR-, AC-) refer to that document.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cross the Road and Survive (Priority: P1)

A player guides a frog from the safe start bank across a road of moving vehicles. The player can
hop in four directions, one tile at a time. Touching a vehicle, or running out of time, costs one
life. The frog returns to the start bank with a fresh timer.

**Why this priority**: The road is the core loop. Without it there is no game. It is also the
first playable slice (BRD phase 1).

**Independent Test**: Start a game, hop the frog across all five road lanes, and confirm it
reaches the median. Then let it touch a vehicle and confirm exactly one life is lost and the frog
returns to the start bank.

**Acceptance Scenarios**:

1. **Given** a new game, **When** the player presses a movement key or taps, **Then** the frog
   hops one tile in that direction.
2. **Given** the frog is mid-hop, **When** the player presses another direction, **Then** at most
   one extra input is kept and the rest are ignored, and the frog cannot change direction mid-hop.
3. **Given** the frog is on a road lane, **When** a vehicle touches it, **Then** one life is lost
   and the frog returns to the start bank with a fresh timer.
4. **Given** the frog is on the start bank, **When** the player tries to hop below it or past the
   left or right edge, **Then** the frog does not move.
5. **Given** the timer for the current life reaches zero, **When** the frog is anywhere, **Then**
   one life is lost and the frog returns to the start bank.

---

### User Story 2 - Cross the River and Fill the Bays (Priority: P1)

After the road, the frog crosses the safe median and a river of drifting logs and turtles. The
player must reach one of five empty home bays at the top. Filling all five clears the level.

**Why this priority**: The river and bays turn the road into a complete level. A full level can
be cleared only with this story (BRD phase 2).

**Independent Test**: Hop the frog across the river onto logs and turtles and into an empty bay.
Fill all five bays and confirm the level clears and the next level begins with bays empty.

**Acceptance Scenarios**:

1. **Given** the frog is on a log or surfaced turtle, **When** the log moves, **Then** the frog
   moves with it, and the player can still hop left and right while riding.
2. **Given** the frog lands on open water, **When** it arrives, **Then** one life is lost.
3. **Given** the frog is carried past the left or right edge on a log or turtle, **When** it
   crosses the edge, **Then** one life is lost.
4. **Given** the frog is on a submerged diving turtle group, **When** the group submerges, **Then**
   the frog drowns and one life is lost.
5. **Given** the frog is on a sinking or rising turtle group, **When** the group changes state,
   **Then** the frog stays alive.
6. **Given** the frog reaches a home bay that is empty, **When** it arrives, **Then** the bay fills
   and the frog returns to the start bank.
7. **Given** the frog lands on a bay wall or an already-filled bay, **When** it arrives, **Then**
   one life is lost.
8. **Given** all five bays are filled, **When** the last one fills, **Then** a short celebration
   plays, the bays empty, and the next, faster level begins.

---

### User Story 3 - Score Points and Progress Through Levels (Priority: P2)

The player earns points for moving forward, for reaching bays, and for time left. Each level is
faster and more crowded than the last, up to a cap level so the game stays beatable. The player
earns a bonus life at a score threshold, up to five lives total.

**Why this priority**: Scoring and progression give the game its replay value. The base game
works without them, so this comes after the core loop (BRD phase 3).

**Independent Test**: Play one level, record the score, and check it against the scoring rules.
Clear several levels and confirm speed and density increase until the cap level, then stop.

**Acceptance Scenarios**:

1. **Given** the frog moves forward onto a row it has not yet reached in this life, **When** it
   arrives, **Then** 10 points are added.
2. **Given** the frog reaches a bay, **When** it arrives, **Then** 50 points are added plus 10
   points for each full second left on the timer.
3. **Given** the player clears a level, **When** the level clears, **Then** 1,000 points are added.
4. **Given** the score reaches 10,000 for the first time, **When** the threshold is crossed,
   **Then** one bonus life is awarded, up to a maximum of five lives.
5. **Given** the player reaches the cap level, **When** later levels start, **Then** speed, density,
   and dive share stop increasing.
6. **Given** the last life is lost, **When** the game ends, **Then** the game-over screen shows the
   final score.

---

### User Story 4 - Play on a Phone with Touch Controls (Priority: P2)

A casual player opens the game on a phone, starts in one tap, and hops with swipes and taps.
The page does not scroll or zoom during play. The game pauses when the player leaves the tab and
shows a rotate-device screen in landscape.

**Why this priority**: Mobile is a primary audience, and the BRD requires mobile-first play
(BRD phase 3).

**Independent Test**: On a phone in portrait, start a game with one tap, hop with swipes in all
four directions and with taps forward, then switch apps and return. Confirm the game is paused
and nothing scrolled or zoomed.

**Acceptance Scenarios**:

1. **Given** a swipe of at least about 24 CSS pixels in one direction, **When** the player swipes,
   **Then** the frog hops that way once.
2. **Given** a tap anywhere on the playfield, **When** the player taps, **Then** the frog hops
   forward.
3. **Given** a game is in progress on a phone, **When** the player swipes, pinches, double-taps,
   or pulls down, **Then** the page does not scroll, zoom, or refresh.
4. **Given** the phone is held in landscape, **When** orientation changes, **Then** a
   rotate-device screen appears and the game pauses.
5. **Given** the page becomes hidden or the tab loses focus, **When** that happens, **Then** the
   game pauses automatically.
6. **Given** a player opens the game for the first time, **When** the first screen appears,
   **Then** a one-screen control hint for the current device appears and can be reopened from the
   pause menu.

---

### User Story 5 - Play with the Keyboard and Accessible Visuals (Priority: P2)

A player can play and navigate every menu with the keyboard alone. Hazards can be told apart by
shape and pattern, not only by color. A speed assist slows lanes and extends the timer for players
who need more time.

**Why this priority**: Accessibility is a stated business objective, and the BRD requires
keyboard and color-blind support in v1 (BRD phase 5, moved up here so visuals are designed for it
from the start).

**Independent Test**: Complete a full game, including initials entry, using only the keyboard.
Then view the game through color-blindness simulations and confirm each hazard type remains
distinct.

**Acceptance Scenarios**:

1. **Given** any menu, **When** the player uses only the arrow keys or WASD, Enter, Space, and Esc,
   **Then** every control is reachable and shows a visible focus indicator.
2. **Given** a player views vehicles, logs, turtles, water, and safe zones under protanopia,
   deuteranopia, or tritanopia simulation, **When** they compare them, **Then** each type is still
   distinguishable.
3. **Given** speed assist is on, **When** a game starts, **Then** lane speeds are 70% of normal
   and the timer is 45 seconds.
4. **Given** the player is in a game, **When** they try to change speed assist, **Then** the change
   is blocked until the next game.
5. **Given** UI text on any screen, **When** it is measured against its background, **Then** body
   text meets a 4.5:1 contrast ratio.

---

### User Story 6 - Save High Scores and Settings on the Device (Priority: P3)

When a score makes the top-10 list, the player enters three letters as initials. The table and
settings are kept on the device and survive a page reload. If browser storage is blocked, the game
still plays and says that scores will not be saved.

**Why this priority**: High scores add a goal, but the game is complete without them (BRD phase 4).

**Independent Test**: Finish a game with a qualifying score, enter initials, reload the page, and
confirm the entry is still listed. Then block storage and confirm the game still plays with a notice.

**Acceptance Scenarios**:

1. **Given** a finished game with a score that qualifies, **When** the game-over screen appears,
   **Then** the player is asked for 3-letter initials.
2. **Given** initials are saved, **When** the page is reloaded, **Then** the entry still appears in
   the top-10 table with its score, level reached, date, and assist marker if applicable.
3. **Given** a score was set with speed assist on, **When** it appears in the table, **Then** it
   shows an assist marker.
4. **Given** the player changes a setting, **When** they return in a later session on the same
   device, **Then** the setting is still in effect.
5. **Given** browser storage is blocked or full, **When** the player starts a game, **Then** the
   game plays and shows a short notice that scores will not be saved.
6. **Given** the player chooses to reset high scores, **When** they confirm, **Then** the table is
   cleared. Without confirmation, nothing changes.

---

### User Story 7 - Install the Game and Play Offline (Priority: P3)

A player who has visited the game once can install it to their home screen or desktop, and play a
full game with no network connection. When a new version is available, the player is offered an
update, but never during a game.

**Why this priority**: Offline play and installation show the game is fully self-contained, but the
game works in a normal browser without them (BRD phase 5).

**Independent Test**: Visit the game online, install it, switch to airplane mode, launch the
installed copy, and play a full game.

**Acceptance Scenarios**:

1. **Given** a player has loaded the game once with a network connection, **When** they go offline
   and launch the game, **Then** it starts and plays a full game.
2. **Given** a player uses a supported browser, **When** they choose to install, **Then** the game
   installs to the home screen on Android and iOS, or to the desktop on Chrome and Edge.
3. **Given** a new version is deployed, **When** the player is on the title or pause screen,
   **Then** a small update prompt appears, and the game reloads only if the player agrees.
4. **Given** a game is in progress, **When** a new version is available, **Then** no update prompt
   appears until the game ends.

---

### Edge Cases

- What happens when the frog is on a log that carries it into the edge while the player holds a
  hop key? The edge death takes priority, and the frog returns to the start bank.
- What happens when two hop inputs arrive during one hop? The first is buffered, and the rest are
  dropped.
- What happens when the timer runs out on the same frame the frog reaches a bay? The bay counts
  only if the frog arrived before the timer reached zero.
- What happens when all lives are gone and the score qualifies for the top-10 table but storage is
  blocked? The game-over screen shows the score and the storage notice, and no initials prompt is
  shown.
- What happens when the player pauses during a diving turtle's sinking warning? The timer and turtle
  cycle both stop until the game resumes.
- What happens when the player reaches the cap level? Difficulty stops increasing, and the game
  continues with the same settings for every later level.
- What happens when the device is locked or the app is switched during a game? The game pauses and
  resumes in the same state.
- What happens when a player hops onto a bay that is already filled? One life is lost, the same as
  landing on a wall.

## Requirements *(mandatory)*

### Functional Requirements

**Playfield and movement**

- **FR-001**: The playfield MUST be a logical grid of 13 columns by 13 rows, scaled to fit the
  screen (FR-1).
- **FR-002**: Rows MUST be arranged top to bottom as: one home row with five bays separated by
  walls, five river lanes, one safe median, five road lanes, and one safe start bank (FR-2).
- **FR-003**: The HUD MUST show score, high score, lives remaining, level number, and the timer bar.
  The HUD MUST sit outside the grid and MUST NOT cover any lane (FR-3).
- **FR-004**: Each lane MUST have a direction, speed, and spawn pattern. Lane objects MUST wrap or
  respawn off-screen so no lane runs empty (FR-4).
- **FR-005**: The frog MUST move one tile per hop in four directions. A hop MUST take about 120 ms,
  and the frog MUST NOT change direction mid-hop (FR-5).
- **FR-006**: The game MUST buffer one pending hop. Further inputs during a hop MUST be dropped
  (FR-6).
- **FR-007**: The frog MUST NOT move below the start bank or past the left or right edge of the grid
  (FR-7).
- **FR-008**: On a log or turtle, the frog MUST move with it, and the player MUST still be able to
  hop left and right while riding (FR-8).

**Hazards and deaths**

- **FR-009**: Contact with a road vehicle MUST kill the frog (FR-9).
- **FR-010**: Landing on open water MUST kill the frog (FR-10).
- **FR-011**: Being carried past the left or right edge MUST kill the frog (FR-11).
- **FR-012**: Landing on a bay wall, or on a bay that is already filled, MUST kill the frog (FR-12).
- **FR-013**: The timer reaching zero MUST kill the frog (FR-13).
- **FR-014**: Collision areas MUST be slightly smaller than the visible sprites so near misses read
  as fair (FR-14).
- **FR-015**: A death MUST play a short animation and sound, remove exactly one life, and return the
  frog to the start bank with a fresh timer. Filled bays MUST stay filled (FR-15).

**Diving turtles**

- **FR-016**: Turtles MUST travel in groups of 2 or 3. Some groups MUST dive on a cycle of surfaced,
  sinking (with warning frames), submerged, and rising (FR-16).
- **FR-017**: A frog on a submerged group MUST drown. A frog on a sinking or rising group MUST be
  safe (FR-17).
- **FR-018**: The sinking warning MUST last at least 0.75 s at base speed and MUST be shown by shape
  and animation, not color alone (FR-18).
- **FR-019**: The share of diving groups and the dive cycle speed MUST increase with the level
  (FR-19).

**Lives, timer, and levels**

- **FR-020**: The player MUST start with 3 lives. One bonus life MUST be awarded at 10,000 points
  (tunable). The maximum is 5 lives (FR-20).
- **FR-021**: Each life MUST have a countdown timer of 30 seconds (tunable), shown as a shrinking
  bar. In the last 5 seconds the bar MUST change shape or pattern and a warning sound MUST play
  (FR-21).
- **FR-022**: Filling all five bays MUST clear the level, play a short celebration, empty the bays,
  and start the next level (FR-22).
- **FR-023**: Levels MUST loop without end. Each level MUST raise lane speeds, object density, and
  dive share, and shorten logs. All of these MUST stop increasing at the cap level (default level
  12) (FR-23).
- **FR-024**: The game MUST end when the last life is lost. The game-over screen MUST show the final
  score and, if it qualifies, ask for 3-letter initials (FR-24).

**Scoring**

- **FR-025**: The player MUST earn 10 points for each forward hop onto a row not yet reached in the
  current life (FR-25).
- **FR-026**: The player MUST earn 50 points for each frog that reaches a bay (FR-26).
- **FR-027**: The player MUST earn 10 points for each full second left on the timer when a frog
  reaches a bay (FR-27).
- **FR-028**: The player MUST earn 1,000 points for clearing a level (FR-28).
- **FR-029**: All point values and timings MUST be set in one configuration file so tuning does not
  need code changes (FR-29, NFR-10).

**Controls**

- **FR-030**: On desktop, arrow keys and WASD MUST hop. P or Esc MUST pause. Enter or Space MUST
  confirm in menus (FR-30).
- **FR-031**: On mobile, a swipe in any of four directions MUST hop that way. A tap anywhere on the
  playfield MUST hop forward. The minimum swipe distance is about 24 CSS pixels, with one hop per
  gesture (FR-31).
- **FR-032**: During a game on mobile, page scrolling, pull-to-refresh, double-tap zoom, and pinch
  zoom MUST be disabled (FR-32).
- **FR-033**: On browsers that support it, a short haptic pulse MUST play on death and on reaching a
  bay. A setting MUST turn it off (FR-33).
- **FR-034**: The first launch MUST show a one-screen control hint for the current device type. It
  MUST be reopenable from the pause menu (FR-34).

**Game states and menus**

- **FR-035**: The game MUST have these states: title, playing, paused, level clear, game over, high
  scores, and settings (FR-35).
- **FR-036**: The game MUST pause automatically when the tab loses focus or the page is hidden
  (FR-36).
- **FR-037**: Settings MUST include music volume, effects volume, mute all, speed assist on or off,
  haptics on or off, and reset high scores (with confirmation) (FR-37).
- **FR-038**: Every menu and button MUST be reachable and usable with the keyboard alone, with a
  visible focus indicator (FR-38).

**Scores and saved data**

- **FR-039**: The top-10 table MUST store initials, score, level reached, date, and an assist flag.
  Data MUST be saved on the device only (FR-39).
- **FR-040**: Scores set with speed assist MUST show an assist marker in the table (FR-40).
- **FR-041**: Settings MUST persist between sessions on the same device (FR-41).
- **FR-042**: If browser storage is blocked or full, the game MUST still play and MUST show a short
  notice that scores will not be saved (FR-42).

**Audio and visuals**

- **FR-043**: Original sound effects MUST exist for hop, vehicle death, drowning, reaching a bay,
  level clear, timer warning, game over, and menu actions (FR-43).
- **FR-044**: Original background music MUST play on the title and gameplay screens and loop without
  an audible gap (FR-44).
- **FR-045**: Audio MUST NOT start until the player's first interaction (FR-45).
- **FR-046**: All art, sound, fonts, names, and layouts MUST be original or licensed for this use.
  No material may be copied from the arcade original or any other commercial game (FR-46, OI-3).
- **FR-047**: Pixel art MUST scale by whole-number multiples with smoothing off where the screen
  allows. Leftover space MUST be filled with a themed border (FR-47).
- **FR-048**: On a phone held in landscape, the game MUST show a rotate-device screen and pause
  (FR-48).

**Accessibility**

- **FR-049**: Vehicles, logs, turtles, water, and safe zones MUST differ by shape, outline, or
  pattern as well as hue. The palette MUST be checked against protanopia, deuteranopia, and
  tritanopia simulations (FR-49).
- **FR-050**: Speed assist MUST set lane speeds to 70% and the timer to 45 seconds. It MUST be
  changeable only between games (FR-50).
- **FR-051**: The game MUST support full keyboard play, as in FR-030 and FR-038 (FR-51).
- **FR-052**: UI text MUST meet WCAG 2.2 AA contrast, with 4.5:1 for body text (FR-52).

**Installation and offline play**

- **FR-053**: The game MUST provide install metadata with a name, icons (including a maskable icon),
  a theme color, and portrait orientation (FR-53).
- **FR-054**: After the first load, the game MUST launch and play with no network connection
  (FR-54).
- **FR-055**: When a new version is deployed, an "update available" prompt MUST appear. The game
  MUST reload only if the player agrees, and never during a game (FR-55).
- **FR-056**: The game MUST install to the home screen on Android Chrome and iOS Safari, and to the
  desktop on Chrome and Edge (FR-56).

**Non-functional requirements**

- **NFR-001**: The game MUST run in the latest two major versions of Chrome, Edge, Firefox, and
  Safari on desktop; Safari on iOS; and Chrome on Android (NFR-1).
- **NFR-002**: The game MUST hold 60 frames per second on a mid-range phone from 2022 or later and
  on current desktops (NFR-2). Input-to-hop latency MUST be under 50 ms (NFR-4).
- **NFR-003**: Game logic MUST run on a fixed timestep, so 60 Hz, 120 Hz, and 144 Hz screens play
  the same (NFR-3).
- **NFR-004**: The full download, including art and audio, MUST be under 3 MB (NFR-5).
- **NFR-005**: The game MUST be playable within 3 seconds on a 4G connection on first visit and
  within 1 second on repeat visits (NFR-6).
- **NFR-006**: The layout MUST work from 360 px wide phones to 4K monitors and MUST respect
  safe-area insets on notched phones (NFR-7).
- **NFR-007**: The game MUST NOT use cookies, tracking, or third-party scripts. All data MUST stay
  on the device (NFR-8).
- **NFR-008**: The game MUST NOT crash or soft-lock across a 30-minute session. Pausing, resuming,
  switching tabs, and screen lock MUST NOT break game state (NFR-9).
- **NFR-009**: The game MUST be hosted as static files over HTTPS on GitHub Pages, with no server
  code or database (NFR-12, constraints).
- **NFR-010**: Automated tests MUST cover collision, scoring, level progression, and turtle dive
  cycles. A manual test pass on one iPhone, one Android phone, and three desktop browsers MUST
  happen before release (NFR-11).

### Key Entities *(include if feature involves data)*

- **Frog**: The player's character. It has a current tile, a life count, and a timer for the
  current life. It can ride a log or turtle group.
- **Lane**: One horizontal row of the playfield. It has a direction, a speed, a spawn pattern, and
  a type (road, river, median, bank, or home).
- **Road Vehicle**: An object in a road lane. It has a length and a speed, and it kills the frog on
  contact.
- **Log**: A floating object in a river lane. It carries the frog and has a length that shortens
  with the level.
- **Turtle Group**: A set of 2 or 3 turtles that floats like a log. It may dive through surfaced,
  sinking, submerged, and rising states.
- **Home Bay**: One of five goals at the top of the playfield. It is empty or filled.
- **Level**: One stage of play, with its lane speeds, density, dive share, and bay state. Levels
  repeat, and progression stops at the cap level.
- **Score Entry**: One top-10 record. It holds initials, score, level reached, date, and an assist
  flag. It is saved on the device only.
- **Settings**: The player's saved options: music volume, effects volume, mute, speed assist,
  and haptics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can start a game within two taps or key presses of opening the game
  address.
- **SC-002**: A player can finish a full game, from title screen to game over with initials
  entered, using only the keyboard.
- **SC-003**: Players can clear all five bays in a level, and the next level is noticeably faster
  than the one before it.
- **SC-004**: Speed and density stop increasing at the cap level, and the game remains playable at
  that level on a mid-range phone at a steady frame rate.
- **SC-005**: Players can tell every hazard type apart under three types of color-blindness
  simulation.
- **SC-006**: A player who installs the game can play a full game with no network connection.
- **SC-007**: A top-10 score entered by a player is still listed after the page is reloaded.
- **SC-008**: The full game downloads in under 3 MB and is playable within 3 seconds on a 4G
  connection on first visit.
- **SC-009**: No reported crash or freeze in a 30-minute play session, including pause, tab switch,
  and screen lock.
- **SC-010**: Each of the seven death causes costs exactly one life and triggers in the situation it
  is designed for.

## Assumptions

- The BRD's default tuning values apply unless playtests change them: 30-second life timer, 10,000
  point bonus-life threshold, cap at level 12, and the base lane speeds are set during build
  (BRD OI-4).
- The final game name is still open (BRD OI-1). This spec uses the working title "Project Hop" only
  as a repository name, and the name must not include "Frogger" (AC-11).
- Art and audio will be original or licensed for portfolio use with attribution (BRD OI-3).
- Tech stack is open (BRD OI-2). Requirements in this spec describe behavior only and do not
  choose a language or framework.
- The grid is 13 by 13 tiles. The sprite size and grid scale target (for example 16 px tiles) are
  open (BRD OI-5) and will be decided during planning.
- The reference "mid-range phone from 2022 or later" will be named during planning so the frame-rate
  requirement can be tested.
- Players use a current browser with scripting enabled and local browser storage available
  (BRD assumptions).
- iOS does not support browser vibration, so haptic feedback is available only on Android (BRD
  assumptions).
- Ads, analytics, accounts, online leaderboards, and multiplayer are out of scope for v1 (BRD
  section 3.2).
- Endless mode, time attack, daily challenge, extra river hazards, bonus pickups, reduced-motion mode,
  and gamepad support are future versions and out of scope for v1 (BRD section 11).
- Landscape play on phones is not supported. Only portrait is supported (BRD section 3.2).
