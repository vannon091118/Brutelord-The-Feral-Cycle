// @doc: docs/daten/raid/raid-state.md#raid-state
import { RAID_CONFIG, RAID_FORMAT_VERSION, teamStamina } from './raid-config.js';
import { HIVE_ORIGIN } from '../world/world-config.js';
import { RAID_PHASE, advance } from './raid-phases.js';
import { createHive, createWardens } from './raid-warden.js';
import { teamTraitProfile } from './raid-traits.js';

function toHero(hero, apScale) {
  const ap = Math.round(hero.speed * apScale);
  return { id: hero.id, name: hero.name, atk: hero.atk, grit: hero.grit, dig: hero.dig === true, apMax: ap, ap };
}

export function teamGritOf(ticket) {
  return ticket.heroes.reduce((sum, hero) => sum + (hero.grit ?? 0), 0);
}

export function createRaidState(ticket, config = RAID_CONFIG) {
  const stamina = teamStamina(teamGritOf(ticket), config);
  const traits = teamTraitProfile(ticket.heroes);
  const seed = ticket.snapshotSeed ?? 0;
  return {
    format: RAID_FORMAT_VERSION,
    ticketId: ticket.id,
    entry: { ...ticket.entry },
    at: { ...ticket.entry },
    order: null,
    target: null,
    path: [],
    phase: RAID_PHASE.ENTER,
    stamina,
    staminaMax: stamina,
    round: 1,
    heroes: ticket.heroes.map((hero) => toHero(hero, traits.apScale)),
    traits,
    dug: {},
    wardens: createWardens({ seed, origin: HIVE_ORIGIN }),
    hive: createHive(HIVE_ORIGIN),
    sacrificed: [],
    carried: null,
    secured: false,
    lost: false,
    log: [],
  };
}

export function canSpend(state, cost) {
  return state.stamina >= cost;
}

export function spend(state, cost) {
  return canSpend(state, cost) ? { ...state, stamina: state.stamina - cost } : state;
}

export function transition(state, event) {
  const kante = advance(state.phase, event);
  if (!kante.ok) return state;
  const bezahlt = spend(state, kante.staminaCost);
  return bezahlt === state ? state : { ...bezahlt, phase: kante.to };
}

function refillAp(hero) {
  return { ...hero, ap: hero.apMax };
}

export function nextRound(state) {
  return { ...state, round: state.round + 1, heroes: state.heroes.map(refillAp) };
}

export function record(state, entry) {
  return { ...state, log: [...state.log, entry] };
}

export function stateHashInput(state) {
  return {
    format: state.format,
    at: state.at,
    order: state.order?.verb ?? null,
    path: state.path.length,
    stamina: state.stamina,
    phase: state.phase,
    heroes: state.heroes.map((hero) => ({ id: hero.id, ap: hero.ap })),
    dug: Object.keys(state.dug).length,
    wardens: state.wardens.map((wache) => ({ id: wache.id, hp: wache.hp, coma: wache.coma })),
    hive: state.hive.hp,
    carried: state.carried,
    secured: state.secured,
    lost: state.lost,
  };
}
