/** Der Raid-Zustand: eine zweite Instanz, isoliert vom Heimat-Zustand. */
import { RAID_PHASE, RAID_CONFIG, teamStamina } from './raid-config.js';

function toHero(hero) {
  return {
    id: hero.id,
    name: hero.name,
    atk: hero.atk,
    grit: hero.grit,
    dig: hero.dig === true,
    apMax: hero.speed,
    ap: hero.speed,
  };
}

export function teamGritOf(ticket) {
  return ticket.heroes.reduce((sum, hero) => sum + (hero.grit ?? 0), 0);
}

export function createRaidState(ticket, config = RAID_CONFIG) {
  const stamina = teamStamina(teamGritOf(ticket), config);
  return {
    ticketId: ticket.id,
    entry: { ...ticket.entry },
    at: { ...ticket.entry },
    phase: RAID_PHASE.INFILTRATING,
    stamina,
    staminaMax: stamina,
    round: 1,
    heroes: ticket.heroes.map(toHero),
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
    at: state.at,
    stamina: state.stamina,
    phase: state.phase,
    heroes: state.heroes.map((hero) => ({ id: hero.id, ap: hero.ap })),
  };
}