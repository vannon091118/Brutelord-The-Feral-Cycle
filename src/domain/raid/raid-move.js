// @doc: docs/daten/raid/raid-move.md#raid-move
import { tileId } from '../world/tile.js';
import { mixRaid, textSeed, unitOf } from './raid-spawn-seed.js';
import { RAID_ACTION, RAID_STEP, neighborOf } from './raid-actions.js';
import { applyAction, resolveLoss } from './raid-steps.js';
import { cellCost, planPath, frontierOf } from './raid-path.js';
import { bindsGroup } from './raid-warden.js';
import { RAID_VERB } from './raid-verbs.js';

const SALT_EXPLORE = 1103515245;

function exploreGoal(state, world) {
  const frontier = frontierOf(state, world);
  if (frontier.length === 0) return null;
  const stream = mixRaid(textSeed(`${state.ticketId}|${state.round}|${tileId(state.at.x, state.at.y)}`), SALT_EXPLORE);
  return frontier[Math.floor(unitOf(stream) * frontier.length)];
}

function actionToward(state, world, id) {
  for (const type of RAID_STEP) {
    const point = neighborOf(state.at, { type });
    if (tileId(point.x, point.y) !== id) continue;
    return { type: cellCost(state, world, id) > 0 ? type.replace('MOVE', 'DIG') : type };
  }
  return null;
}

function approachTile(state, world, order) {
  const here = tileId(state.at.x, state.at.y);
  for (const step of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
    const point = { x: order.x + step.x, y: order.y + step.y };
    if (tileId(point.x, point.y) !== here && planPath(state, world, point) !== null) return point;
  }
  return null;
}

export function orderFrom(state, world, order) {
  if (!order) return state;
  const here = tileId(state.at.x, state.at.y);
  const goal = order.verb === RAID_VERB.ATTACK ? approachTile(state, world, order) : order;
  if (!goal) return state;
  const path = planPath(state, world, goal);
  if (path === null || tileId(goal.x, goal.y) === here) return state;
  return { ...state, order, target: { x: order.x, y: order.y }, path };
}

function arrived(state, world) {
  if (!state.order || state.path.length > 0) return state;
  const bereinigt = { ...state, order: null, path: [], target: null };
  return state.order.verb === RAID_VERB.ATTACK ? applyAction(bereinigt, world, { type: RAID_ACTION.ATTACK }) : bereinigt;
}

function exploreOrder(state, world) {
  const goal = exploreGoal(state, world);
  return goal === null ? state : orderFrom(state, world, { verb: RAID_VERB.DIG, ...parseGoal(goal) });
}

function parseGoal(id) {
  const [x, y] = id.split(',').map(Number);
  return { x, y };
}

function advanced(before, after) {
  return after.at.x !== before.at.x || after.at.y !== before.at.y;
}

function step(state, world) {
  if (bindsGroup(state)) return state;
  const ordered = state.order && state.path.length > 0 ? state : exploreOrder(state, world);
  if (!ordered.order) return ordered;
  const action = actionToward(ordered, world, ordered.path[0]);
  const moved = action === null ? ordered : applyAction(ordered, world, action);
  if (action === null || !advanced(ordered, moved)) return { ...moved, order: null, path: [], target: null };
  return arrived({ ...moved, path: moved.path.slice(1) }, world);
}

export function tickMove(state, world) {
  return resolveLoss(step(state, world));
}
