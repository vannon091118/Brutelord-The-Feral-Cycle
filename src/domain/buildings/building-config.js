// @doc: docs/daten/buildings/building-config.md#building-config
import { ESSENCE_ECONOMY } from '../economy/essence-economy.js';

export const BUILDING_TYPE = Object.freeze({
  SWARM_HOST: 'SWARM_HOST',
  ESSENCE_EXTRACTOR: 'ESSENCE_EXTRACTOR',
  BRUTE_LORD: 'BRUTE_LORD',
  LADDER_SHAFT: 'LADDER_SHAFT',
});

export const BUILDING_STATE = Object.freeze({
  SITE: 'SITE',
  READY: 'READY',
});

export const PLACEMENT_REASON = Object.freeze({
  NO_FLOOR: 'NO_FLOOR',
  NO_SPACE: 'NO_SPACE',
});

const COST = Object.freeze({ extractor: 5, swarmHost: 6, bruteLord: 10, ladderShaft: 8 });

const OPENING_DIGS = 3;

export const BUILDING_DEFS = Object.freeze({
  [BUILDING_TYPE.SWARM_HOST]: Object.freeze({
    label: 'Schwarmhort',
    hint: 'Brütet Arbeiter',
    width: 1,
    height: 1,
    cost: COST.swarmHost,
    spawnEveryMs: 20000,
  }),
  [BUILDING_TYPE.ESSENCE_EXTRACTOR]: Object.freeze({
    label: 'Essenz Extractor',
    hint: 'Presst Essenz',
    width: 1,
    height: 1,
    cost: COST.extractor,
    maxWorkers: 3,
  }),
  [BUILDING_TYPE.BRUTE_LORD]: Object.freeze({
    label: 'Brutlord',
    hint: '2 × 2 Felder',
    width: 2,
    height: 2,
    cost: COST.bruteLord,
  }),
  [BUILDING_TYPE.LADDER_SHAFT]: Object.freeze({
    label: 'Leiterschacht',
    hint: 'Öffnet Raid und Etage 2',
    width: 1,
    height: 1,
    cost: COST.ladderShaft,
  }),
});

export const START_ESSENCE = COST.extractor + OPENING_DIGS * ESSENCE_ECONOMY.miningCost;

export const MAX_DUNGLINGS = 6;

export function buildingDef(type) {
  return BUILDING_DEFS[type] ?? null;
}

export function canAfford(essence, type) {
  const def = buildingDef(type);
  return Boolean(def) && essence >= def.cost;
}
