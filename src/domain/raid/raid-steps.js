// @doc: docs/daten/raid/raid-steps.md#raid-steps
import { RAID_ACTION, isDigAction, isKnownAction } from './raid-actions.js';
import { RAID_EVENT, RAID_PHASE, actionsAllowedIn, isTerminal } from './raid-phases.js';
import { approachSteps } from './raid-config.js';
import { allWardensDown, bindsGroup, hiveFallen } from './raid-warden.js';
import { transition } from './raid-state.js';
import { stepInto } from './raid-traverse.js';
import { attackStep, lootStep, sacrificeStep } from './raid-verbs.js';

function categoryOf(action) {
  if (isDigAction(action)) return 'DIG';
  if (action.type === RAID_ACTION.ATTACK) return 'ATTACK';
  if (action.type === RAID_ACTION.SACRIFICE) return 'SACRIFICE';
  if (action.type === RAID_ACTION.LOOT) return 'LOOT';
  return 'MOVE';
}

function atHome(state) {
  return approachSteps(state.at, state.entry) === 0;
}

function extraction(state) {
  if (state.phase === RAID_PHASE.LOOT) return transition(state, RAID_EVENT.EXTRACTED);
  if (state.phase !== RAID_PHASE.EXTRACTING || !atHome(state)) return state;
  const heim = transition(state, RAID_EVENT.EXTRACTED);
  return heim === state ? state : { ...heim, secured: true };
}

function travel(state, world, action) {
  if (bindsGroup(state)) return state;
  const gezogen = stepInto(state, world, action);
  return gezogen === state ? state : extraction(gezogen);
}

function siege(state) {
  const offen = hiveFallen(state.hive) && allWardensDown(state.wardens);
  return state.phase === RAID_PHASE.COMBAT && offen ? transition(state, RAID_EVENT.WARDEN_FELL) : state;
}

function booty(state) {
  const kante = transition(state, RAID_EVENT.LOOT_TAKEN);
  return kante === state ? state : lootStep(kante);
}

function offer(state) {
  const kante = transition(state, RAID_EVENT.SACRIFICED);
  return kante === state ? state : sacrificeStep(kante);
}

function deed(state, action) {
  if (action.type === RAID_ACTION.ATTACK) return siege(attackStep(state, { ...state.hive.at }));
  if (action.type === RAID_ACTION.SACRIFICE) return offer(state);
  return booty(state);
}

export function resolveLoss(state) {
  if (isTerminal(state.phase) || state.stamina > 0) return state;
  const verloren = transition(state, RAID_EVENT.RAID_LOST);
  return verloren === state ? state : { ...verloren, carried: null, lost: true };
}

export function applyAction(state, world, action) {
  if (!isKnownAction(action) || isTerminal(state.phase)) return state;
  const kategorie = categoryOf(action);
  if (!actionsAllowedIn(state.phase).includes(kategorie)) return state;
  const danach = kategorie === 'MOVE' || kategorie === 'DIG' ? travel(state, world, action) : deed(state, action);
  return resolveLoss(danach);
}
