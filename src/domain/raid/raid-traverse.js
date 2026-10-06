// @doc: docs/daten/raid/raid-traverse.md#raid-traverse
import { tileAt } from '../world/grid.js';
import { TILE_KIND, terrainOf, tileId } from '../world/tile.js';
import { canDig } from './raid-config.js';
import { RAID_EVENT, RAID_PHASE } from './raid-phases.js';
import { isDigAction, neighborOf } from './raid-actions.js';
import { cellCost } from './raid-path.js';
import { record, spend, transition } from './raid-state.js';

function isKnown(state, world, at) {
  const kind = tileAt(world, at.x, at.y)?.kind;
  return state.dug[tileId(at.x, at.y)] === true || kind === TILE_KIND.DUNGEON_FLOOR || kind === TILE_KIND.HIVE;
}

function entersHive(state, tile) {
  return tile.kind === TILE_KIND.HIVE && state.phase === RAID_PHASE.ENTER;
}

function arrive(state, tile, dugId) {
  const betreten = entersHive(state, tile) ? transition(state, RAID_EVENT.ENTERED_HIVE) : state;
  if (entersHive(state, tile) && betreten === state) return state;
  return {
    ...betreten,
    at: { x: tile.x, y: tile.y },
    dug: dugId ? { ...betreten.dug, [dugId]: true } : betreten.dug,
  };
}

function dig(state, { world, action, tile }) {
  const terrain = terrainOf(tile);
  if (!terrain || !canDig(terrain, state.heroes)) return state;
  const bezahlt = spend(state, cellCost(state, world, tile.id));
  return bezahlt === state ? state : arrive(record(bezahlt, action), tile, tile.id);
}

export function stepInto(state, world, action) {
  const at = neighborOf(state.at, action);
  const tile = tileAt(world, at.x, at.y);
  if (!tile) return state;
  if (isDigAction(action)) return dig(state, { world, action, tile });
  return isKnown(state, world, at) ? arrive(record(state, action), tile, null) : state;
}
