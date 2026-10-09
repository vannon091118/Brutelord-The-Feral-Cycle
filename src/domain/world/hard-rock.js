// @doc: docs/daten/world/hard-rock.md#hard-rock
import { GRID_HEIGHT, GRID_WIDTH, HIVE_ORIGIN, HIVE_SIZE, LADDER_TILE } from './world-config.js';
import { TILE_TERRAIN, tileId } from './tile.js';

export const HARD_ROCK = Object.freeze({
  blockStride: 4,
  sizeMin: 2,
  sizeMax: 3,
  skipPerMille: 420,
  hiveExclusion: 2,
  obsidianPerMille: 120,
});

function rockHash(x, y, seed) {
  return (Math.imul(x + 1013904223, 73856093) ^ Math.imul(y + 1664525, 19349663) ^ Math.imul(seed + 3266489917, 2246822519)) >>> 0;
}

function rockPick(hash, salt, max) {
  return Math.floor(((Math.imul(hash ^ salt, 2654435761) >>> 0) / 4294967296) * max);
}

function sameSpot({ x, y, other }) {
  return Boolean(other) && other.x === x && other.y === y;
}

function isExcluded({ x, y, hiveOrigin, spawnTile }) {
  const dx = Math.max(hiveOrigin.x - x, x - (hiveOrigin.x + HIVE_SIZE.width - 1), 0);
  const dy = Math.max(hiveOrigin.y - y, y - (hiveOrigin.y + HIVE_SIZE.height - 1), 0);
  if (Math.max(dx, dy) <= HARD_ROCK.hiveExclusion) return true;
  return sameSpot({ x, y, other: spawnTile }) || sameSpot({ x, y, other: LADDER_TILE });
}

function blockCells({ originX, originY, hash, width, height, excluded }) {
  const size = HARD_ROCK.sizeMin + rockPick(hash, 45, HARD_ROCK.sizeMax - HARD_ROCK.sizeMin + 1);
  const cells = [];
  for (let dy = 0; dy < size; dy += 1) {
    for (let dx = 0; dx < size; dx += 1) {
      const x = originX + dx;
      const y = originY + dy;
      if (x >= width || y >= height || excluded.has(tileId(x, y))) continue;
      cells.push(tileId(x, y));
    }
  }
  return cells.length >= 2 ? cells : null;
}

function blocksOf({ width, height, excluded, seed }) {
  const blocks = [];
  for (let y = 0; y + HARD_ROCK.blockStride <= height; y += HARD_ROCK.blockStride) {
    for (let x = 0; x + HARD_ROCK.blockStride <= width; x += HARD_ROCK.blockStride) {
      const hash = rockHash(x, y, seed);
      if (rockPick(hash, 3, 1000) < HARD_ROCK.skipPerMille) continue;
      const cells = blockCells({ originX: x, originY: y, hash, width, height, excluded });
      if (cells) blocks.push({ cells, hash });
    }
  }
  return blocks;
}

export function createHardRock(context = {}) {
  const width = context.width ?? GRID_WIDTH;
  const height = context.height ?? GRID_HEIGHT;
  const hiveOrigin = context.hiveOrigin ?? HIVE_ORIGIN;
  const seed = context.seed ?? 0;
  const spawnTile = context.spawnTile ?? null;
  const excluded = new Set();
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isExcluded({ x, y, hiveOrigin, spawnTile })) excluded.add(tileId(x, y));
    }
  }
  const terrain = {};
  for (const block of blocksOf({ width, height, excluded, seed })) {
    const sorte = rockPick(block.hash, 71, 1000) < HARD_ROCK.obsidianPerMille
      ? TILE_TERRAIN.OBSIDIAN
      : TILE_TERRAIN.STONE;
    for (const id of block.cells) terrain[id] = sorte;
  }
  return terrain;
}
