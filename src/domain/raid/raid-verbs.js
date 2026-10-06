// @doc: docs/daten/raid/raid-verbs.md#raid-verbs
import { RAID_CONFIG, RAID_SIEGE } from './raid-config.js';
import { anyWardenConscious, damageHive, damageWardens, hiveInReach } from './raid-warden.js';
import { carriedLoot } from './raid-traits.js';
import { record } from './raid-state.js';

export const RAID_VERB = Object.freeze({
  DIG: 'DIG',
  ATTACK: 'ATTACK',
  SACRIFICE: 'SACRIFICE',
  LOOT: 'LOOT',
});

function strike(state, damage) {
  if (damage <= 0) return state;
  if (anyWardenConscious(state.wardens)) return { ...state, wardens: damageWardens(state, damage) };
  if (hiveInReach(state)) return { ...state, hive: damageHive(state.hive, damage) };
  return state;
}

export function attackStep(state, target) {
  const cost = RAID_CONFIG.attackApCost;
  const joiners = state.heroes.filter((hero) => hero.ap >= cost);
  if (joiners.length === 0) return state;
  const charged = new Set(joiners.map((hero) => hero.id));
  const heroes = state.heroes.map((hero) => (charged.has(hero.id) ? { ...hero, ap: hero.ap - cost } : hero));
  const damage = joiners.reduce((sum, hero) => sum + hero.atk, 0);
  const geschlagen = strike({ ...state, heroes }, damage);
  return record(geschlagen, { verb: RAID_VERB.ATTACK, target, participants: joiners.length, damage });
}

export function sacrificeStep(state) {
  if (state.heroes.length <= 1) return state;
  const victim = state.heroes[state.heroes.length - 1];
  const heroes = state.heroes.filter((hero) => hero.id !== victim.id);
  const gestaerkt = { ...state, heroes, sacrificed: [...state.sacrificed, victim.id] };
  const gefuellt = { ...gestaerkt, stamina: Math.min(state.staminaMax, state.stamina + RAID_SIEGE.sacrificeStamina) };
  return record(gefuellt, { verb: RAID_VERB.SACRIFICE, target: victim.id, gain: gefuellt.stamina - state.stamina });
}

export function lootStep(state) {
  const beute = Object.freeze({ essence: carriedLoot(RAID_SIEGE.lootEssence, state.traits) });
  return record({ ...state, carried: beute }, { verb: RAID_VERB.LOOT, target: state.hive.at, essence: beute.essence });
}
