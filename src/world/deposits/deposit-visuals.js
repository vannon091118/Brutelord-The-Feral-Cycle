// @doc: docs/daten/deposits/deposit-visuals.md#deposit-visuals
import { DEPOSIT_PHASE, ESSENCE_STAGE } from '../../domain/deposits/deposit-config.js';
import { depositFill, depositStage } from '../../domain/deposits/deposit-state.js';
import { touchingTiles } from '../../domain/deposits/deposit-hint.js';
import { getTile } from '../../domain/world/grid.js';
import { ROOTING_PHASE } from '../../domain/world/rooting.js';
import { makeRng, soilBlob, tileSeed } from '../tile-shapes.js';

const SHARD_BY_STAGE = Object.freeze({
  [ESSENCE_STAGE.RICH]: 8,
  [ESSENCE_STAGE.MEDIUM]: 7,
  [ESSENCE_STAGE.LEAN]: 5,
  [ESSENCE_STAGE.DEAD]: 4,
});

const COLOR_KEYS = Object.freeze({
  [ESSENCE_STAGE.RICH]: ['bright', 'bright', 'bright', 'mid', 'mid', 'mid', 'dead', 'dead'],
  [ESSENCE_STAGE.MEDIUM]: ['bright', 'mid', 'mid', 'mid', 'dead', 'dead', 'dead'],
  [ESSENCE_STAGE.LEAN]: ['bright', 'mid', 'dead', 'dead', 'dead'],
  [ESSENCE_STAGE.DEAD]: ['dead', 'dead', 'dead', 'dead'],
});

const TONE = Object.freeze({
  bright: 'var(--color-essence-300)',
  mid: 'var(--color-essence-400)',
  dead: 'var(--color-essence-dead)',
});

const BURST_SHARDS = Object.freeze(['bright', 'bright', 'mid', 'mid', 'dead']);
const ASH_PIECES = 7;

function round(value) {
  return Math.round(value * 100) / 100;
}

function seeded(seed, salt) {
  return makeRng((seed ^ Math.imul(salt + 1, 2654435761)) >>> 0);
}

function shard({ tile, index, count, stage }) {
  const rng = seeded(tileSeed(tile.x, tile.y), index + 17);
  const colors = COLOR_KEYS[stage];
  const colorKey = colors[index % colors.length];
  const angle = (index / count) * Math.PI * 2 + rng() * 0.9;
  const reach = 8 + rng() * 12;
  return {
    key: `${tile.id}-shard-${index}`,
    fill: TONE[colorKey],
    r: round(1.4 + rng() * 2.1),
    x: round(rng() * 30),
    y: round(rng() * 26),
    dx: Math.round(Math.cos(angle) * reach),
    dy: Math.round(Math.sin(angle) * (reach * 0.8)),
    delay: round(rng() * 1.6),
    dur: round(1.6 + rng() * 1.4),
    scale: round(0.7 + rng() * 0.7),
  };
}

export function depositShards(tile, deposit) {
  const stage = depositStage(deposit);
  const count = SHARD_BY_STAGE[stage];
  return Array.from({ length: count }, (_, index) => shard({ tile, index, count, stage }));
}

export function harvestBurst({ tile, seq, size, to }) {
  const rng = seeded(tileSeed(tile.x, tile.y), (seq ?? 0) + 53);
  const aim = to ?? tile;
  const flightX = (aim.x - tile.x) * size;
  const flightY = (aim.y - tile.y) * size;
  return BURST_SHARDS.map((colorKey, index) => {
    const angle = (index / BURST_SHARDS.length) * Math.PI * 2 + rng() * 0.7;
    const reach = 14 + rng() * 16;
    const spawnX = Math.round(Math.cos(angle) * reach);
    const spawnY = Math.round(Math.sin(angle) * reach * 0.8);
    return {
      key: `${tile.id}-burst-${seq}-${index}`,
      fill: TONE[colorKey],
      r: round(1.1 + rng() * 1.4),
      x: spawnX,
      y: spawnY,
      sx: Math.round(flightX - spawnX),
      sy: Math.round(flightY - spawnY),
      life: Math.round(360 + rng() * 260),
    };
  });
}

export function ashBurst(tile, seq) {
  const rng = seeded(tileSeed(tile.x, tile.y), (seq ?? 0) + 977);
  return Array.from({ length: ASH_PIECES }, (_, index) => {
    const angle = (index / ASH_PIECES) * Math.PI * 2 + rng() * 0.5;
    return {
      key: `${tile.id}-ash-${seq}-${index}`,
      fill: rng() > 0.45 ? TONE.dead : 'var(--color-soil-950)',
      r: round(1.2 + rng() * 2),
      x: round(8 + rng() * 34),
      y: round(6 + rng() * 30),
      dx: Math.round(Math.cos(angle) * (10 + rng() * 20)),
      dy: Math.round(Math.sin(angle) * (8 + rng() * 14)),
      fall: Math.round(26 + rng() * 26),
      life: Math.round(700 + rng() * 520),
    };
  });
}

export function hintTiles(world, tiles) {
  const hinted = Object.values(world.deposits ?? {}).filter((deposit) => deposit.phase === DEPOSIT_PHASE.HINTED);
  const spots = new Set();
  for (const deposit of hinted) {
    for (const cellId of deposit.cells) {
      const cell = getTile(world, cellId);
      if (!cell) continue;
      for (const neighbor of touchingTiles(world, cell)) {
        if (neighbor.rooting.phase !== ROOTING_PHASE.DARK) spots.add(neighbor.id);
      }
    }
  }
  return tiles.filter((tile) => spots.has(tile.id));
}

export function depositHalo(tile, size) {
  const span = size * 3;
  return soilBlob({
    x: tile.x * size + size * 0.5 - span * 0.5,
    y: tile.y * size + size * 0.5 - span * 0.5,
    size: span,
    inset: 0,
    jitter: 18,
    points: 8,
    seed: tileSeed(tile.x, tile.y),
    outward: 14,
  });
}

export function haloStops(deposit) {
  const share = depositFill(deposit);
  return [
    { offset: 0, opacity: round(0.08 + 0.1 * share) },
    { offset: 0.5, opacity: round(0.04 + 0.04 * share) },
    { offset: 1, opacity: 0 },
  ];
}
