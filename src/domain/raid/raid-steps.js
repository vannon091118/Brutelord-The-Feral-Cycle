/** Die Übergänge: gehen ist gratis, graben kostet Ausdauer, beides fail closed. */
import { tileAt } from '../world/grid.js';
import { TILE_KIND, terrainOf, tileId } from '../world/tile.js';
import { RAID_PHASE, canDig } from './raid-config.js';
import { isDigAction, isKnownAction, neighborOf } from './raid-actions.js';
import { cellCost } from './raid-path.js';
import { record, spend } from './raid-state.js';

function isKnown(state, world, at) {
  const kind = tileAt(world, at.x, at.y)?.kind;
  return state.dug[tileId(at.x, at.y)] === true || kind === TILE_KIND.DUNGEON_FLOOR || kind === TILE_KIND.HIVE;
}

function arrive(state, tile, dugId) {
  return {
    ...state,
    at: { x: tile.x, y: tile.y },
    phase: tile.kind === TILE_KIND.HIVE ? RAID_PHASE.AT_HIVE : state.phase,
    dug: dugId ? { ...state.dug, [dugId]: true } : state.dug,
  };
}

/** Der Preis kommt aus der Pfadfindung, damit Plan und Schritt dieselbe Zahl nennen. */
function dig(state, { world, action, tile }) {
  const terrain = terrainOf(tile);
  if (!terrain || !canDig(terrain, state.heroes)) return state;
  const cost = cellCost(state, world, tile.id);
  const bezahlt = spend(state, cost);
  return bezahlt === state ? state : arrive(record(bezahlt, action), tile, tile.id);
}

export function applyAction(state, world, action) {
  if (!isKnownAction(action) || state.phase === RAID_PHASE.RESOLVED) return state;
  const at = neighborOf(state.at, action);
  const tile = tileAt(world, at.x, at.y);
  if (!tile) return state;
  if (isDigAction(action)) return dig(state, { world, action, tile });
  return isKnown(state, world, at) ? arrive(record(state, action), tile, null) : state;
}