// @doc: docs/daten/deposits/deposit-placement.md#deposit-placement
import { DEPOSIT_CONFIG, DEPOSIT_PHASE, capacityAtDepth, hiveDistance } from './deposit-config.js';
import { blockHash, keepBlock, pick } from './deposit-hash.js';
import { GRID_HEIGHT, GRID_WIDTH, HIVE_ORIGIN, HIVE_SIZE, LADDER_TILE } from '../world/world-config.js';
import { tileId } from '../world/tile.js';

export function createDeposits(context = {}) {
  const conf = DEPOSIT_CONFIG;
  const width = context.width ?? GRID_WIDTH;
  const height = context.height ?? GRID_HEIGHT;
  const hiveOrigin = context.hiveOrigin ?? HIVE_ORIGIN;
  const seed = context.seed ?? 0;
  const depth = context.depth ?? 0;
  const blocked = blockedCells({ width, height, hiveOrigin, conf, spawnTile: context.spawnTile ?? null });
  const deposits = {};
  blockOrigins({ width, height, conf }).forEach((origin, index) => {
    const deposit = clusterAt({ ...origin, index, conf, blocked, seed, depth });
    if (deposit) deposits[deposit.id] = deposit;
  });
  return deposits;
}

function blockOrigins({ width, height, conf }) {
  const origins = [];
  for (let y = 0; y + conf.blockStride <= height; y += conf.blockStride) {
    for (let x = 0; x + conf.blockStride <= width; x += conf.blockStride) origins.push({ x, y });
  }
  return origins;
}

function clusterAt({ x, y, index, conf, blocked, seed, depth }) {
  const hash = blockHash(x, y, seed);
  if (!keepBlock(hash, conf.skipPerMille)) return null;
  const size = sizeFor(hash, conf);
  const cells = cellsFor({ x, y, hash, size, conf, blocked });
  if (!cells) return null;
  const capacity = capacityAtDepth(capacityFor(size, conf), depth);
  return { id: `deposit-${index}`, phase: DEPOSIT_PHASE.BURIED, pool: capacity, capacity, size, cells };
}

function sizeFor(hash, conf) {
  return conf.sizeMin + pick(hash, 45, conf.sizeMax - conf.sizeMin + 1);
}

function capacityFor(size, conf) {
  return Math.min(conf.capacityPerTile + (size - 1) * conf.capacityPerExtraTile, conf.capacityMax);
}

function cellsFor({ x, y, hash, size, conf, blocked }) {
  const span = conf.blockStride - 2 * conf.innerInset;
  const cells = [];
  const used = new Set();
  for (let i = 0; i < size; i += 1) {
    const cell = freeCell({ x, y, hash, i, span, inset: conf.innerInset, used, blocked });
    if (!cell) return null;
    used.add(cell.key);
    cells.push(cell.id);
  }
  return cells;
}

function freeCell({ x, y, hash, i, span, inset, used, blocked }) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const salt = 17 + i * 7 + attempt * 101;
    const cx = x + inset + pick(hash, salt, span);
    const cy = y + inset + pick(hash, salt + 1, span);
    const key = `${cx},${cy}`;
    if (used.has(key) || blocked.has(key)) continue;
    return { key, id: tileId(cx, cy) };
  }
  return null;
}

function blockedCells({ width, height, hiveOrigin, conf, spawnTile }) {
  const blocked = new Set();
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isBlocked({ x, y, hiveOrigin, conf, spawnTile })) blocked.add(`${x},${y}`);
    }
  }
  return blocked;
}

function isBlocked({ x, y, hiveOrigin, conf, spawnTile }) {
  if (hiveDistance({ x, y, hiveOrigin, hiveSize: HIVE_SIZE }) <= conf.hiveExclusion) return true;
  return sameSpot({ x, y, other: spawnTile }) || sameSpot({ x, y, other: LADDER_TILE });
}

function sameSpot({ x, y, other }) {
  return Boolean(other) && other.x === x && other.y === y;
}
