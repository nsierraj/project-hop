import type { Frog } from './frog';
import type { LaneObject } from './lanes';

export type DeathCause = 'vehicle' | 'water' | 'edge' | 'drowned' | 'timer' | 'wall' | 'bay';

/** Hitboxes are inset from the sprite so near misses read as fair (FR-14). */
export const FROG_INSET = 0.15;
export const VEHICLE_INSET = 0.1;

/** True if the frog's hitbox overlaps a vehicle's hitbox. Both are in tile units on the same row. */
export function overlapsVehicle(frog: Frog, vehicle: LaneObject): boolean {
  const frogStart = frog.col + FROG_INSET;
  const frogEnd = frog.col + 1 - FROG_INSET;
  const vehicleStart = vehicle.x + VEHICLE_INSET;
  const vehicleEnd = vehicle.x + vehicle.length - VEHICLE_INSET;
  return frogStart < vehicleEnd && vehicleStart < frogEnd;
}

/** The river object under the frog's centre, or undefined if the frog is over open water. */
export function objectUnderFrog(frog: Frog, objects: LaneObject[]): LaneObject | undefined {
  const centre = frog.col + 0.5;
  return objects.find((obj) => obj.x <= centre && centre < obj.x + obj.length);
}

/** True if the frog's centre has left the grid. */
export function isOffGrid(frog: Frog, columns: number): boolean {
  const centre = frog.col + 0.5;
  return centre < 0 || centre >= columns;
}
