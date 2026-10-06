// @doc: docs/daten/raid/raid-ticket.md#raid-ticket
import { MAX_DUNGLINGS } from '../buildings/building-config.js';
import { HIVE_ORIGIN } from '../world/world-config.js';
import { statsOf } from '../brutelord/stone-roll.js';
import { RAID_CONFIG, maxTeamGrit } from './raid-config.js';
import { createRaidWorld } from './raid-world.js';
import { entryPointFor, entrySeed } from './raid-spawn-seed.js';

export const CADRE_REASON = Object.freeze({
  LEER: 'Der Kader ist leer.',
  ZU_VIELE: 'Der Kader ist groesser als der Schwarm.',
  FREMD: 'Der Kader nennt einen Dungling, den der Hive nicht hat.',
  DOPPELT: 'Der Kader nennt denselben Dungling zweimal.',
  GEFALSCHT: 'Der Kader nennt Zahlen, die der Hive nicht hat.',
  ZU_STARK: 'Der Kader traegt mehr Grit, als der Raid zulaesst.',
});

const BEHAUPTET = Object.freeze(['atk', 'speed', 'grit', 'dig']);

function kennungOf(held) {
  return String(typeof held === 'string' ? held : held?.id);
}

function behauptetFalsch(held, stats) {
  if (typeof held !== 'object' || held === null) return false;
  return BEHAUPTET.some((key) => held[key] !== undefined && held[key] !== stats[key]);
}

function heroRecord(worker) {
  const stats = statsOf(worker);
  const id = String(worker?.id);
  return {
    id,
    name: typeof worker?.name === 'string' && worker.name ? worker.name : id,
    atk: stats.atk,
    speed: stats.speed,
    grit: stats.grit,
    dig: stats.dig,
    traits: stats.traits,
  };
}

export function cadreRule({ heroes, dunglings, config = RAID_CONFIG }) {
  if (!Array.isArray(heroes) || heroes.length === 0) return { ok: false, reason: CADRE_REASON.LEER };
  if (heroes.length > MAX_DUNGLINGS) return { ok: false, reason: CADRE_REASON.ZU_VIELE };
  const vorrat = new Map((dunglings ?? []).map((worker) => [String(worker?.id), worker]));
  const ids = heroes.map(kennungOf);
  if (!ids.every((id) => vorrat.has(id))) return { ok: false, reason: CADRE_REASON.FREMD };
  if (new Set(ids).size !== ids.length) return { ok: false, reason: CADRE_REASON.DOPPELT };
  const kader = ids.map((id) => heroRecord(vorrat.get(id)));
  if (heroes.some((held, index) => behauptetFalsch(held, kader[index]))) return { ok: false, reason: CADRE_REASON.GEFALSCHT };
  const grit = kader.reduce((sum, held) => sum + held.grit, 0);
  if (grit > maxTeamGrit(config)) return { ok: false, reason: CADRE_REASON.ZU_STARK };
  return { ok: true, grit, heroes: kader };
}

export function ticketFrom({ id, attackerId, defenderId, defenderSeed, heroes }) {
  const seed = entrySeed({ attackerId, defenderId, defenderSeed });
  const point = entryPointFor(createRaidWorld({ snapshotSeed: defenderSeed }), { seed, origin: HIVE_ORIGIN });
  if (!point) return null;
  return Object.freeze({
    id,
    defender: defenderId,
    snapshotSeed: defenderSeed,
    entry: Object.freeze({ x: point.x, y: point.y }),
    heroes,
  });
}
