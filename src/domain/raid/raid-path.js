/** Die Pfadfindung: der günstigste Weg im Ausdauerbudget, nicht der kürzeste. */
import { tileAt, neighborIds } from '../world/grid.js';
import { TILE_KIND, isBuildable, terrainOf, parseTileId, tileId } from '../world/tile.js';
import { canDig, digCost } from './raid-config.js';

export const UNREACHED = Infinity;

function touchesTrail(state, world, id) {
  return neighborIds(world, id).some((next) => state.dug[next] === true);
}

/** Gegrabener Boden ist gratis, ungegrabener kostet — am eigenen Tunnel das Doppelte. */
export function cellCost(state, world, id) {
  if (state.dug[id] === true) return 0;
  const { x, y } = parseTileId(id);
  const tile = tileAt(world, x, y);
  if (!tile || tile.kind === TILE_KIND.HIVE) return UNREACHED;
  if (isBuildable(tile)) return 0;
  const terrain = terrainOf(tile);
  if (!terrain || !canDig(terrain, state.heroes)) return UNREACHED;
  const price = digCost(terrain);
  return touchesTrail(state, world, id) ? price * state.traits.digScale : price;
}

function tracePath(came, id) {
  const path = [];
  let cursor = id;
  while (cursor !== undefined) {
    path.unshift(cursor);
    cursor = came.get(cursor);
  }
  return path.slice(1);
}

/** Dijkstra über Ausdauer: ein Weg, der das Budget überschreitet, wird nicht ausgegeben. */
export function planPath(state, world, goal) {
  const target = tileId(goal.x, goal.y);
  const start = tileId(state.at.x, state.at.y);
  const cheapest = new Map([[start, 0]]);
  const came = new Map();
  const queue = [{ id: start, cost: 0 }];
  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const node = queue.shift();
    if (node.cost > cheapest.get(node.id)) continue;
    if (node.id === target) return tracePath(came, node.id);
    for (const next of neighborIds(world, node.id)) {
      const cost = node.cost + cellCost(state, world, next);
      if (cost > state.stamina) continue;
      if (cost >= (cheapest.get(next) ?? UNREACHED)) continue;
      cheapest.set(next, cost);
      came.set(next, node.id);
      queue.push({ id: next, cost });
    }
  }
  return null;
}

/** Die Frontlinie: grabbare Felder am Rand des bereits gelaufenen Bereichs. */
export function frontierOf(state, world) {
  const known = [tileId(state.at.x, state.at.y), ...Object.keys(state.dug)];
  const frontier = [];
  for (const id of known) {
    for (const next of neighborIds(world, id)) {
      const price = cellCost(state, world, next);
      if (price > 0 && price < UNREACHED && !frontier.includes(next)) frontier.push(next);
    }
  }
  return frontier;
}