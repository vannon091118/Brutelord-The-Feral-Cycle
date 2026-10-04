/** Mutation: Steine in einen Dungling verbauen und ihn zurückentwickeln. */
import { ACTION } from '../../domain/actions/action-types.js';
import { fusionStones, fuse, isMutant, nextCandidate, refundFor, asBase } from '../../domain/brutelord/mutant.js';

export function reduceMutant(state, action) {
  if (action.type === ACTION.MUTANT_CREATED) return created(state);
  if (action.type === ACTION.MUTANT_REVERTED) return reverted(state, action.workerId);
  if (action.type === ACTION.RAID_TEAM_TOGGLED) return toggled(state, action.workerId);
  if (action.type === ACTION.RAID_STARTED) return startedRaid(state);
  if (action.type === ACTION.RAID_ABORTED) return abortedRaid(state);
  return state;
}

import { calculateStamina } from '../../domain/brutelord/stamina.js';
import { createRaidWorld } from '../../domain/raid/raid-world.js';

function startedRaid(state) {
  if (state.activeRaid || state.raidTeam.length === 0) return state;
  const stamina = calculateStamina(state.raidTeam, state.dunglings);
  if (stamina <= 0) return state;
  return { ...state, activeRaid: { world: createRaidWorld(), stamina, maxStamina: stamina } };
}

function abortedRaid(state) {
  return state.activeRaid ? { ...state, activeRaid: null } : state;
}

function toggled(state, workerId) {
  const worker = state.dunglings.find((entry) => entry.id === workerId);
  if (!worker || !isMutant(worker)) return state;
  const inTeam = state.raidTeam.includes(workerId);

  if (inTeam) {
    return { ...state, raidTeam: state.raidTeam.filter(id => id !== workerId) };
  }

  if (state.raidTeam.length >= 3) return state; // Max team size is 3 for now

  return { ...state, raidTeam: [...state.raidTeam, workerId] };
}

/** Erschaffen braucht das offene Labor, einen Kandidaten und einen Stein im Slot. */
function created(state) {
  if (!state.lab.open) return state;
  const stones = fusionStones(state.lab);
  const worker = nextCandidate(state.dunglings);
  if (stones.length === 0 || !worker) return state;
  const mutant = fuse(worker, stones);
  if (!mutant) return state;
  return {
    ...state,
    dunglings: state.dunglings.map((entry) => (entry.id === worker.id ? mutant : entry)),
    lab: { ...state.lab, stones: state.lab.stones.filter((stone) => stone.slot === null) },
  };
}

/** Zurückentwickeln geht jederzeit, auch mitten im Auftrag — er läuft weiter. */
function reverted(state, workerId) {
  const worker = state.dunglings.find((entry) => entry.id === workerId);
  if (!worker || !isMutant(worker)) return state;
  return {
    ...state,
    essence: state.essence + refundFor(worker),
    dunglings: state.dunglings.map((entry) => (entry.id === workerId ? asBase(entry) : entry)),
  };
}