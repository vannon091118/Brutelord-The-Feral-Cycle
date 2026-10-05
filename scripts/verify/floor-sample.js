/** Die Stichprobe fuer die Etagen-Pruefung: Spielerseeds, die eine Ebene
 *  ueberhaupt erst zu einer Welt machen, und die Messungen darum herum. */
import { DEEPEST_FLOOR, floorSeed } from '../../src/domain/world/floor.js';
import { worldSeed } from '../../src/domain/world/world-seed.js';
import { countFloorTiles } from '../../src/domain/world/grid.js';

export const SAMPLE_SEEDS = ['a1b2c3d4', '00ff00ff', '7fffffff', 12345678];

export function istStartwelt(playerseed) {
  return floorSeed(playerseed, 0) === worldSeed(playerseed);
}

export function istAndereWelt(playerseed) {
  return floorSeed(playerseed, 1) !== floorSeed(playerseed, 0);
}

export function seedsOfTiefen() {
  return SAMPLE_SEEDS.flatMap((seed) => Array.from({ length: DEEPEST_FLOOR + 1 }, (_, tiefe) => floorSeed(seed, tiefe)));
}

/** Der Raum einer Welt, gemessen an der Welt selbst und nicht an einer Zahl. */
export function nutzbarerRaum(world) {
  return countFloorTiles(world);
}
