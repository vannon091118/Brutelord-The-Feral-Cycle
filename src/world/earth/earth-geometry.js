// @doc: docs/daten/earth/earth-geometry.md#earth-geometry
import { EARTH_HEALTH, TILE_TERRAIN } from '../../domain/world/tile.js';
import { edgeMask, hiddenMask, notchFlags, sideFlags } from '../../domain/world/edge-mask.js';
import { chipBlob, crackPath, soilMaskBlob, soilSpeckles, tileSeed, wallBand } from '../tile-shapes.js';

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

const CACHE_LIMIT = 512;
const geometryCache = new Map();

export function earthGeometry({ tile, size, world = null }) {
  const openByte = world ? edgeMask(world, tile.x, tile.y) : 0;
  const hiddenByte = world ? hiddenMask(world, tile.x, tile.y) : 0;
  const rock = tile.terrain === TILE_TERRAIN.STONE || tile.terrain === TILE_TERRAIN.OBSIDIAN ? tile.terrain : '';
  const key = `${tile.x},${tile.y}|${size}|${tile.earthHealth}|${openByte}|${hiddenByte}|${rock}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const geometry = buildGeometry({ tile, size, openByte, hiddenByte, rock });
  if (geometryCache.size >= CACHE_LIMIT) geometryCache.clear();
  geometryCache.set(key, geometry);
  return geometry;
}

function buildGeometry({ tile, size, openByte, hiddenByte, rock }) {
  const seed = tileSeed(tile.x, tile.y);
  const x = tile.x * size;
  const y = tile.y * size;
  const critical = tile.earthHealth === EARTH_HEALTH.CRITICAL;
  const open = sideFlags(openByte);
  const hidden = sideFlags(hiddenByte);
  const notch = notchFlags(openByte, open);
  return {
    x,
    y,
    size,
    seed,
    center: { x: x + size / 2, y: y + size / 2 },
    open,
    hidden,
    notch,
    mass: soilMaskBlob({ x, y, size, open, notch, seed }),
    rock,
    walls: wallBand({ x, y, size, hidden, seed }),
    speckles: soilSpeckles({ x, y, size, count: 6, seed, inset: 4 }),
    handLines: handLines({ x, y, size, seed }),
    damage: damageOf({ x, y, size, seed, health: tile.earthHealth }),
    shiver: critical,
  };
}
