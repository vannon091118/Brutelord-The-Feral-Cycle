/** Geometrie eines Erdblocks: Umriss, Körner, Risse. */
import { EARTH_HEALTH } from '../../domain/world/tile.js';
import { chipBlob, crackPath, soilBlob, soilSpeckles, tileSeed } from '../tile-shapes.js';

function handLines({ x, y, size, seed }) {
  return [
    {
      key: 'edge-dark',
      d: crackPath({ x, y, size, seed, index: 41, spread: 0.85 }),
      stroke: 'var(--color-soil-900)',
      width: 0.85,
      opacity: 0.3,
    },
    {
      key: 'edge-light',
      d: crackPath({ x, y, size, seed, index: 67, spread: 0.7 }),
      stroke: 'var(--color-soil-300)',
      width: 0.7,
      opacity: 0.14,
    },
  ];
}

function damageOf({ x, y, size, seed, health }) {
  if (health === EARTH_HEALTH.HEALTHY) return null;
  const critical = health === EARTH_HEALTH.CRITICAL;
  const chips = critical ? 3 : 1;
  const cracks = critical ? 3 : 1;
  const positions = (count) => Array.from({ length: count }, (_, index) => index);
  return {
    chips: positions(chips).map((index) =>
      chipBlob({ x, y, size, seed, index, grow: critical ? 1.25 : 0.9 }),
    ),
    cracks: positions(cracks).map((index) => ({
      key: `crack-${index}`,
      d: crackPath({ x, y, size, seed, index, spread: critical ? 1.15 : 0.85 }),
      width: critical ? 1.5 : 1.05,
      opacity: critical ? 0.7 : 0.5,
    })),
    loose: critical
      ? positions(3).map((index) =>
          chipBlob({ x, y, size, seed: seed ^ 0x1f, index: index + 9, grow: 0.75 }),
        )
      : [],
    darken: critical ? 0.16 : 0.07,
  };
}

export function earthGeometry({ tile, size }) {
  const seed = tileSeed(tile.x, tile.y);
  const x = tile.x * size;
  const y = tile.y * size;
  const critical = tile.earthHealth === EARTH_HEALTH.CRITICAL;
  return {
    x,
    y,
    size,
    seed,
    center: { x: x + size / 2, y: y + size / 2 },
    mass: soilBlob({ x, y, size, inset: 4, jitter: 2.6, outward: 10, points: 16, seed }),
    speckles: soilSpeckles({ x, y, size, count: 6, seed, inset: 4 }),
    handLines: handLines({ x, y, size, seed }),
    damage: damageOf({ x, y, size, seed, health: tile.earthHealth }),
    shiver: critical,
  };
}
