/** Der Raid-Zustand: eine zweite Instanz, isoliert vom Heimat-Zustand. */
import { RAID_PHASE, RAID_CONFIG, RAID_FORMAT_VERSION, teamStamina } from './raid-config.js';
import { teamTraitProfile } from './raid-traits.js';

/** Helden tragen keine Position: `at` gehört der Gruppe (D32). */
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
  return {
    format: RAID_FORMAT_VERSION,
    ticketId: ticket.id,
    entry: { ...ticket.entry },
    at: { ...ticket.entry },
    order: null,
    target: null,
    path: [],
    phase: RAID_PHASE.INFILTRATING,
    stamina,
    staminaMax: stamina,
    round: 1,
    heroes: ticket.heroes.map((hero) => toHero(hero, traits.apScale)),
    traits,
    dug: {},
    log: [],
  };
}

export function canSpend(state, cost) {
  return state.stamina >= cost;
}

/** Fail closed: reicht die Ausdauer nicht, bleibt der Zustand unverändert. */
export function spend(state, cost) {
  return canSpend(state, cost) ? { ...state, stamina: state.stamina - cost } : state;
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
  };
}