/** Der Angriff ist kein Schritt: er hat kein Ziel-Feld, sondern eine Richtungslosigkeit. */
import { RAID_CONFIG } from './raid-config.js';
import { record } from './raid-state.js';

export const RAID_VERB = Object.freeze({ DIG: 'DIG', ATTACK: 'ATTACK' });

/** Jeder Held mit AP zahlt mit; ohne AP gibt es keinen Schlag (fail closed). */
export function attackStep(state, target) {
  const cost = RAID_CONFIG.attackApCost;
  const joiners = state.heroes.filter((hero) => hero.ap >= cost);
  if (joiners.length === 0) return state;
  const charged = new Set(joiners.map((hero) => hero.id));
  const heroes = state.heroes.map((hero) => (charged.has(hero.id) ? { ...hero, ap: hero.ap - cost } : hero));
  return record({ ...state, heroes }, { verb: RAID_VERB.ATTACK, target, participants: joiners.length });
}