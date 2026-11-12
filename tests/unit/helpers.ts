import { loadConfig, type Config } from '../../src/config/loader';
import { Game } from '../../src/core/game';
import type { Lane } from '../../src/core/lanes';

export function config(): Config {
  return loadConfig();
}

/** A started game with a fixed seed. Lanes are emptied so tests control every hazard. */
export function emptyGame(seed = 1, assisted = false): Game {
  const game = new Game(config(), seed);
  game.start(assisted);
  game.lanes.forEach((lane: Lane) => (lane.objects = []));
  return game;
}

/** Runs n steps with no input. */
export function idle(game: Game, n: number): void {
  for (let i = 0; i < n; i++) game.step([]);
}
