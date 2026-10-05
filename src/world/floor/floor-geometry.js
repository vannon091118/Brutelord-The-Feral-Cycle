// @doc: docs/daten/floor/floor-geometry.md#floor-geometry
import { FLOOR_ORIGIN } from '../../domain/world/tile.js';
import { soilBlob, soilSpeckles, tileSeed } from '../tile-shapes.js';
import { stoneMarks } from './substrate.js';

export function floorGeometry({ tile, size }) {
  const seed = (tileSeed(tile.x, tile.y) ^ 0x5bd1) >>> 0;
  const x = tile.x * size;
  const y = tile.y * size;
  const burrow = tile.floorOrigin === FLOOR_ORIGIN.HIVE_BURROW;
  return {
    x,
    y,
    size,
    seed,
    burrow,
    center: { x: x + size / 2, y: y + size / 2 },
    fill: burrow ? 'url(#dl-earthMass)' : 'url(#dl-bedStone)',
    mass: soilBlob({ x, y, size, inset: 3, jitter: 2.4, outward: 9, points: 14, seed }),
    grit: soilSpeckles({ x, y, size, count: 5, seed: seed ^ 0x77, inset: 6 }),
    marks: stoneMarks({ x, y, size, seed: seed ^ 0x5ab1 }),
  };
}
