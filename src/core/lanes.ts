import type { LayoutConfig, LayoutRow } from '../config/loader';
import { advanceDive, startDive, type Dive, type DiveTimings } from './turtles';
import type { Rng } from './rng';

export type ObjectKind = 'vehicle' | 'log' | 'turtleGroup';

export interface LaneObject {
  kind: ObjectKind;
  /** Left edge in tile units. Objects wrap around the grid edges. */
  x: number;
  /** Width in tiles. */
  length: number;
  /** Signed tiles per second. Positive moves right. */
  vel: number;
  /** Set only on diving turtle groups. */
  dive: Dive | null;
}

export interface Lane {
  rowIndex: number;
  kind: 'road' | 'river';
  objects: LaneObject[];
}

export interface LaneParams {
  objectsPerLane: number;
  /** Multiplier on the base lane speed (level and speed assist combined). */
  speedMultiplier: number;
  divingShare: number;
  logMinLength: number;
  logMaxLength: number;
}

/** Extra tiles of off-grid space an object travels through before it wraps. Covers the longest object. */
export const WRAP_MARGIN = 4;

export function createLanes(
  layout: LayoutConfig,
  columns: number,
  baseSpeeds: { river: number; road: number },
  timings: DiveTimings,
  params: LaneParams,
  rng: Rng,
): Lane[] {
  const lanes: Lane[] = [];
  layout.rows.forEach((row, rowIndex) => {
    if (row.kind !== 'river' && row.kind !== 'road') return;
    const dir = row.direction === 'left' ? -1 : 1;
    const base = row.kind === 'river' ? baseSpeeds.river : baseSpeeds.road;
    const speed = base * params.speedMultiplier * dir;
    const count = params.objectsPerLane;
    const spacing = (columns + WRAP_MARGIN) / count;
    const objects: LaneObject[] = [];
    for (let i = 0; i < count; i++) {
      const x = i * spacing + rng.next() * spacing * 0.25 - WRAP_MARGIN;
      objects.push(createObject(row, speed, x, rng, timings, params));
    }
    lanes.push({ rowIndex, kind: row.kind, objects });
  });
  return lanes;
}

function createObject(
  row: LayoutRow,
  vel: number,
  x: number,
  rng: Rng,
  timings: DiveTimings,
  params: LaneParams,
): LaneObject {
  if (row.kind === 'road') {
    return { kind: 'vehicle', x, length: rng.nextInt(1, 2), vel, dive: null };
  }
  if (row.spawn === 'turtle') {
    const diving = rng.next() < params.divingShare;
    return {
      kind: 'turtleGroup',
      x,
      length: rng.nextInt(2, 3),
      vel,
      dive: diving ? startDive(rng, timings) : null,
    };
  }
  return {
    kind: 'log',
    x,
    length: rng.nextInt(params.logMinLength, params.logMaxLength),
    vel,
    dive: null,
  };
}

/** Moves every object in every lane by dtSeconds and wraps objects that leave the grid. */
export function advanceLanes(
  lanes: Lane[],
  columns: number,
  dtSeconds: number,
  stepMs: number,
  timings: DiveTimings,
): void {
  const wrapWidth = columns + WRAP_MARGIN;
  for (const lane of lanes) {
    for (const obj of lane.objects) {
      obj.x += obj.vel * dtSeconds;
      if (obj.vel > 0 && obj.x >= columns) obj.x -= wrapWidth;
      if (obj.vel < 0 && obj.x + obj.length <= 0) obj.x += wrapWidth;
      if (obj.dive) advanceDive(obj.dive, stepMs, timings);
    }
  }
}

export function laneAt(lanes: Lane[], rowIndex: number): Lane | undefined {
  return lanes.find((lane) => lane.rowIndex === rowIndex);
}
