import type { Rng } from './rng';

export type DiveState = 'surfaced' | 'sinking' | 'submerged' | 'rising';

/** The state a diving turtle group is in, with time left in that state. */
export interface Dive {
  state: DiveState;
  /** Milliseconds remaining in the current state. */
  timerMs: number;
}

export interface DiveTimings {
  surfacedMs: number;
  sinkingMs: number;
  submergedMs: number;
  risingMs: number;
}

const NEXT_STATE: Record<DiveState, DiveState> = {
  surfaced: 'sinking',
  sinking: 'submerged',
  submerged: 'rising',
  rising: 'surfaced',
};

export function durationOf(state: DiveState, timings: DiveTimings): number {
  switch (state) {
    case 'surfaced':
      return timings.surfacedMs;
    case 'sinking':
      return timings.sinkingMs;
    case 'submerged':
      return timings.submergedMs;
    case 'rising':
      return timings.risingMs;
  }
}

/** Starts a diving group at a random point in its surfaced phase so groups do not move in step. */
export function startDive(rng: Rng, timings: DiveTimings): Dive {
  return { state: 'surfaced', timerMs: rng.next() * timings.surfacedMs };
}

/** Moves the dive cycle forward by dtMs. Cycle order: surfaced, sinking, submerged, rising. */
export function advanceDive(dive: Dive, dtMs: number, timings: DiveTimings): void {
  dive.timerMs -= dtMs;
  while (dive.timerMs <= 0) {
    dive.state = NEXT_STATE[dive.state];
    dive.timerMs += durationOf(dive.state, timings);
  }
}
