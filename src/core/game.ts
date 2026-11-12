import type { Config } from '../config/loader';
import { STEP_MS } from './clock';
import { allFilled, createBays, resolveHomeLanding, type Bay } from './bays';
import { isOffGrid, objectUnderFrog, overlapsVehicle, type DeathCause } from './collision';
import { createFrog, hopTarget, startHop, type Direction, type Frog } from './frog';
import { createGrid, type Grid } from './grid';
import { advanceLanes, createLanes, laneAt, type Lane } from './lanes';
import { isWarning, lifeDurationMs } from './lifeTimer';
import { levelParams } from './levels';
import { Rng } from './rng';
import { bayPoints, crossesBonusThreshold } from './scoring';

export type Mode = 'title' | 'playing' | 'paused' | 'levelClear' | 'gameOver' | 'highScores' | 'settings';

export type Action = Direction | 'pause' | 'confirm' | 'back';

/** Things that happened during a step. The UI turns these into sounds and haptics. */
export type GameEvent =
  | { type: 'hop' }
  | { type: 'death'; cause: DeathCause }
  | { type: 'bay' }
  | { type: 'bonusLife' }
  | { type: 'timerWarning' }
  | { type: 'levelClear' }
  | { type: 'gameOver' };

const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right'];

function isDirection(action: Action): action is Direction {
  return (DIRECTIONS as readonly string[]).includes(action);
}

/**
 * The game rules as a fixed-step simulation. It has no DOM or Canvas code, so tests can drive it
 * with a seed and a list of actions (Principle I).
 */
export class Game {
  readonly grid: Grid;
  readonly seed: number;

  mode: Mode = 'title';
  level = 1;
  score = 0;
  lives: number;
  bonusLifeAwarded = false;
  assisted = false;
  bays: Bay[];
  frog: Frog;
  lanes: Lane[] = [];
  lifeTimerMs: number;
  timerWarned = false;
  deathTicks = 0;
  deathCause: DeathCause | null = null;
  celebrationTicks = 0;
  events: GameEvent[] = [];

  private rng: Rng;
  /** Logic steps in one hop. Rendering uses it to draw the hop arc. */
  readonly hopSteps: number;
  private readonly deathSteps: number;
  private readonly celebrationSteps: number;

  constructor(
    private readonly cfg: Config,
    seed: number,
  ) {
    this.seed = seed;
    this.rng = new Rng(seed);
    this.grid = createGrid(cfg.layout);
    this.lives = cfg.game.lives.start;
    this.bays = createBays(this.grid.bayCols.length);
    this.frog = createFrog(this.grid);
    this.lifeTimerMs = lifeDurationMs(cfg.game, false);
    this.hopSteps = Math.max(1, Math.round(cfg.game.hop.durationMs / STEP_MS));
    this.deathSteps = Math.round(cfg.game.deathAnimationMs / STEP_MS);
    this.celebrationSteps = Math.round(cfg.game.levelClearCelebrationMs / STEP_MS);
  }

  /** Starts a new game. The same seed always produces the same game. */
  start(assisted: boolean): void {
    this.rng = new Rng(this.seed);
    this.assisted = assisted;
    this.level = 1;
    this.score = 0;
    this.lives = this.cfg.game.lives.start;
    this.bonusLifeAwarded = false;
    this.bays = createBays(this.grid.bayCols.length);
    this.deathTicks = 0;
    this.deathCause = null;
    this.celebrationTicks = 0;
    this.buildLevel();
    this.respawnFrog();
    this.mode = 'playing';
    this.events = [];
  }

  /** Leaves a finished or paused game and returns to the title screen. */
  returnToTitle(): void {
    this.mode = 'title';
    this.events = [];
  }

  /** Advances the game by one fixed logic step. */
  step(actions: Action[]): void {
    this.events = [];

    if (this.mode === 'paused') {
      if (actions.includes('pause') || actions.includes('confirm')) this.mode = 'playing';
      else if (actions.includes('back')) this.mode = 'title';
      return;
    }
    if (this.mode === 'levelClear') {
      this.celebrationTicks--;
      if (this.celebrationTicks <= 0) this.nextLevel();
      return;
    }
    if (this.mode !== 'playing') return;

    if (this.deathTicks > 0) {
      this.deathTicks--;
      if (this.deathTicks === 0) this.afterDeath();
      return;
    }

    if (actions.includes('pause')) {
      this.mode = 'paused';
      return;
    }

    for (const action of actions) {
      if (isDirection(action)) this.queueHop(action);
    }
    this.simulate();
  }

  private simulate(): void {
    const { game } = this.cfg;
    const dtSeconds = STEP_MS / 1000;
    const frog = this.frog;

    advanceLanes(
      this.lanes,
      this.grid.columns,
      dtSeconds,
      STEP_MS,
      game.dive,
    );

    // A frog standing on a moving object moves with it.
    if (frog.riding && frog.hopTicks === 0) {
      frog.col += frog.riding.vel * dtSeconds;
    }

    this.lifeTimerMs -= STEP_MS;
    if (!this.timerWarned && isWarning(this.lifeTimerMs, game)) {
      this.timerWarned = true;
      this.events.push({ type: 'timerWarning' });
    }
    if (this.lifeTimerMs <= 0) {
      this.die('timer');
      return;
    }

    let landed = false;
    if (frog.hopTicks > 0) {
      frog.hopTicks--;
      landed = frog.hopTicks === 0;
    }

    const kind = this.grid.rowKind(frog.row);
    const lane = laneAt(this.lanes, frog.row);

    if (kind === 'road' && lane && lane.objects.some((vehicle) => overlapsVehicle(frog, vehicle))) {
      this.die('vehicle');
      return;
    }

    if (kind === 'river' && frog.hopTicks === 0) {
      if (isOffGrid(frog, this.grid.columns)) {
        this.die('edge');
        return;
      }
      const obj = lane ? objectUnderFrog(frog, lane.objects) : undefined;
      if (!obj) {
        this.die('water');
        return;
      }
      if (obj.dive?.state === 'submerged') {
        this.die('drowned');
        return;
      }
      frog.riding = obj;
    }

    if (kind === 'home' && landed) {
      const outcome = resolveHomeLanding(this.bays, frog.col, this.grid);
      if (outcome.kind === 'death') {
        this.die(outcome.cause);
        return;
      }
      this.bays[outcome.index].filled = true;
      this.addScore(bayPoints(game, this.lifeTimerMs));
      this.events.push({ type: 'bay' });
      if (allFilled(this.bays)) {
        this.completeLevel();
      } else {
        this.respawnFrog();
      }
      return;
    }

    // Start a buffered hop only after this landing has been judged.
    if (landed && frog.buffered) {
      const next = frog.buffered;
      frog.buffered = null;
      this.beginHop(next);
    }
  }

  private queueHop(dir: Direction): void {
    if (this.frog.hopTicks > 0) {
      // Keep one pending hop and drop the rest (FR-6).
      if (this.frog.buffered === null) this.frog.buffered = dir;
      return;
    }
    this.beginHop(dir);
  }

  private beginHop(dir: Direction): void {
    const target = hopTarget(this.frog, dir, this.grid);
    if (!target) return;
    if (target.row < this.frog.maxRowReached) {
      this.addScore(this.cfg.game.points.forwardHop);
      this.frog.maxRowReached = target.row;
    }
    startHop(this.frog, target, this.hopSteps);
    this.events.push({ type: 'hop' });
  }

  private die(cause: DeathCause): void {
    this.lives -= 1;
    this.deathCause = cause;
    this.deathTicks = Math.max(1, this.deathSteps);
    this.frog.buffered = null;
    this.events.push({ type: 'death', cause });
  }

  private afterDeath(): void {
    if (this.lives <= 0) {
      this.mode = 'gameOver';
      this.events.push({ type: 'gameOver' });
      return;
    }
    this.respawnFrog();
  }

  private respawnFrog(): void {
    this.frog = createFrog(this.grid);
    this.lifeTimerMs = lifeDurationMs(this.cfg.game, this.assisted);
    this.timerWarned = false;
    this.deathCause = null;
  }

  private addScore(points: number): void {
    const before = this.score;
    this.score += points;
    if (!this.bonusLifeAwarded && crossesBonusThreshold(this.cfg.game, before, this.score)) {
      this.bonusLifeAwarded = true;
      this.lives = Math.min(this.cfg.game.lives.max, this.lives + 1);
      this.events.push({ type: 'bonusLife' });
    }
  }

  private completeLevel(): void {
    this.addScore(this.cfg.game.points.levelCleared);
    this.mode = 'levelClear';
    this.celebrationTicks = Math.max(1, this.celebrationSteps);
    this.events.push({ type: 'levelClear' });
  }

  private nextLevel(): void {
    this.level += 1;
    this.bays = createBays(this.grid.bayCols.length);
    this.buildLevel();
    this.respawnFrog();
    this.mode = 'playing';
  }

  private buildLevel(): void {
    const params = levelParams(this.level, this.cfg.levels);
    const assistFactor = this.assisted ? this.cfg.game.speedAssist.laneSpeedFactor : 1;
    this.lanes = createLanes(
      this.cfg.layout,
      this.grid.columns,
      this.cfg.levels.laneSpeedTilesPerSecond,
      this.cfg.game.dive,
      {
        objectsPerLane: params.objectsPerLane,
        speedMultiplier: params.speedMultiplier * assistFactor,
        divingShare: params.divingShare,
        logMinLength: params.logMinLength,
        logMaxLength: params.logMaxLength,
      },
      this.rng,
    );
  }
}
