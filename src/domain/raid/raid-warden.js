// @doc: docs/daten/raid/raid-warden.md#raid-warden
import { RAID_CONFIG, RAID_SIEGE, RAID_WARDEN, approachSteps, withinReach } from './raid-config.js';
import { mixRaid, unitOf } from './raid-spawn-seed.js';

const RING = Object.freeze([
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: -1 },
]);

const SALT_WARDEN = 40503;
const SALT_HP = 51977;

function wardenAt({ seed, origin, index, config }) {
  const offset = RING[index % RING.length];
  const hash = mixRaid(seed ^ Math.imul(index + 1, SALT_WARDEN), SALT_HP);
  const hpMax = config.hp + Math.floor(unitOf(hash) * config.hpStep);
  return Object.freeze({
    id: `wache-${index}`,
    seed: mixRaid(hash, SALT_WARDEN),
    at: Object.freeze({ x: origin.x + offset.x, y: origin.y + offset.y }),
    hp: hpMax,
    hpMax,
    atk: config.atk,
    coma: false,
  });
}

export function createWardens({ seed = 0, origin, config = RAID_WARDEN } = {}) {
  const wachen = [];
  for (let index = 0; index < config.count; index += 1) wachen.push(wardenAt({ seed, origin, index, config }));
  return Object.freeze(wachen);
}

export function createHive(origin, config = RAID_SIEGE) {
  return Object.freeze({ at: Object.freeze({ x: origin.x, y: origin.y }), hp: config.hiveHp, hpMax: config.hiveHp });
}

export function wardensAtHand(state, radius = RAID_WARDEN.zoneRadius) {
  return state.wardens.filter((wache) => !wache.coma && withinReach(state.at, wache.at, radius));
}

export function bindsGroup(state, radius = RAID_WARDEN.zoneRadius) {
  return wardensAtHand(state, radius).length > 0;
}

export function anyWardenConscious(wardens) {
  return wardens.some((wache) => !wache.coma);
}

export function allWardensDown(wardens) {
  return !anyWardenConscious(wardens);
}

function coma(wache) {
  return Object.freeze({ ...wache, hp: 0, coma: true, revivesAfterMs: RAID_CONFIG.reviveWindowMs });
}

function nextWarden(state) {
  return state.wardens
    .filter((wache) => !wache.coma)
    .sort((left, right) => approachSteps(state.at, left.at) - approachSteps(state.at, right.at))[0];
}

function hurt(wache, damage) {
  const rest = wache.hp - damage;
  return rest <= 0 ? coma(wache) : Object.freeze({ ...wache, hp: rest });
}

export function damageWardens(state, damage) {
  const nah = damage > 0 ? nextWarden(state) : undefined;
  if (!nah) return state.wardens;
  return Object.freeze(state.wardens.map((wache) => (wache.id === nah.id ? hurt(wache, damage) : wache)));
}

export function damageHive(hive, damage) {
  return damage <= 0 ? hive : Object.freeze({ ...hive, hp: Math.max(0, hive.hp - damage) });
}

export function hiveFallen(hive) {
  return hive.hp <= 0;
}

export function hiveInReach(state, radius = RAID_WARDEN.zoneRadius) {
  return withinReach(state.at, state.hive.at, radius);
}
