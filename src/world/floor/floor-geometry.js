/**
 * Geometrie eines nutzbaren Bodens: gepackte Erde, Kiesel, Mittelpunkt.
 * Rein und deterministisch — dieselbe Kachel sieht immer gleich aus.
 */
import { FLOOR_ORIGIN } from '../../domain/world/tile.js';
import { soilBlob, soilSpeckles, tileSeed } from '../tile-shapes.js';

export function floorGeometry({ tile, size }) {
  const seed = tileSeed(tile.x, tile.y) ^ 0x5bd1;
  const x = tile.x * size;
  const y = tile.y * size;
  return {
    x,
    y,
    size,
    seed,
    center: { x: x + size / 2, y: y + size / 2 },
    burrow: tile.floorOrigin === FLOOR_ORIGIN.HIVE_BURROW,
    pack: soilBlob({ x, y, size, inset: 1.8, jitter: 2.8, points: 8, seed }),
    pebbles: soilSpeckles({ x, y, size, count: 3, seed: seed ^ 0x77 }),
  };
}
