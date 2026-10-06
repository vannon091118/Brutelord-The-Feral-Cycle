/** Die Belagerung im Prüfaufbau: Marsch, Kontakt, Schlag, Opfer und Beute — als Zustandsfolge. */
import { orderFrom, tickMove } from '../../src/domain/raid/raid-move.js';
import { RAID_VERB } from '../../src/domain/raid/raid-verbs.js';
import { RAID_ACTION } from '../../src/domain/raid/raid-actions.js';
import { RAID_CONFIG, RAID_PHASE } from '../../src/domain/raid/raid-config.js';
import { applyAction } from '../../src/domain/raid/raid-steps.js';
import { nextRound } from '../../src/domain/raid/raid-state.js';

export function marchTo(state, world, point) {
  const ordered = orderFrom(state, world, { verb: RAID_VERB.DIG, ...point });
  if (!ordered.path) return [state];
  const folge = [ordered];
  let current = ordered;
  for (let tick = 0; tick < ordered.path.length; tick += 1) {
    current = tickMove(current, world);
    folge.push(current);
  }
  return folge;
}

export function ontoHive(state, world) {
  const dx = world.hiveOrigin.x - state.at.x;
  const dy = world.hiveOrigin.y - state.at.y;
  const richtung = (dx > 0 ? RAID_ACTION.MOVE_E : RAID_ACTION.MOVE_W);
  const senkrecht = (dy > 0 ? RAID_ACTION.MOVE_S : RAID_ACTION.MOVE_N);
  return applyAction(state, world, { type: dx !== 0 ? richtung : senkrecht });
}

export function hit(state, world) {
  return applyAction(state, world, { type: RAID_ACTION.ATTACK });
}

export function stepAside(state, world) {
  return applyAction(state, world, { type: RAID_ACTION.MOVE_N });
}

export function sacrificeDeed(state) {
  return applyAction(state, null, { type: RAID_ACTION.SACRIFICE });
}

export function lootDeed(state) {
  return applyAction(state, null, { type: RAID_ACTION.LOOT });
}

function ohneAp(state) {
  return state.heroes.every((hero) => hero.ap < RAID_CONFIG.attackApCost);
}

export function fight(state, world, limit = 400) {
  const folge = [state];
  let current = state;
  for (let i = 0; i < limit && current.phase === RAID_PHASE.COMBAT; i += 1) {
    const geschlagen = hit(current, world);
    current = ohneAp(geschlagen) ? nextRound(geschlagen) : geschlagen;
    folge.push(current);
  }
  return folge;
}
