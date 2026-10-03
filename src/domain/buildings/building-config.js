/**
 * Was der Hive bauen kann: Grundfläche, Preis in Essenz und was das Bauwerk
 * danach tut. Fakten als eingefrorene Konstanten — kein Magic String in
 * Reducern oder Komponenten.
 */
export const BUILDING_TYPE = Object.freeze({
  /** Brütet neue Arbeiter für den Schwarm. */
  SWARM_HOST: 'SWARM_HOST',
  /** Presst Essenz, ein Dungling pro Zyklus. */
  ESSENCE_EXTRACTOR: 'ESSENCE_EXTRACTOR',
  /** Der Brutlord: groß, teuer, das Ziel des Ausbaus. */
  BRUTE_LORD: 'BRUTE_LORD',
});

export const BUILDING_STATE = Object.freeze({
  /** Der Bauplatz steht, die Essenz fehlt noch — Träger bringen sie hin. */
  SITE: 'SITE',
  /** Fertig gebaut und in Betrieb. */
  READY: 'READY',
});

const COST = Object.freeze({ extractor: 5, swarmHost: 6, bruteLord: 10 });

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
    /** Höchstens so viele Dunglinge arbeiten an einem Extraktor. */
    maxWorkers: 3,
  }),
  [BUILDING_TYPE.BRUTE_LORD]: Object.freeze({
    label: 'Brutlord',
    hint: '2 × 2 Felder',
    width: 2,
    height: 2,
    cost: COST.bruteLord,
  }),
});

/** Der Hive beginnt mit genau einem Extraktor Vorrat — sonst kommt er nie in Gang. */
export const START_ESSENCE = COST.extractor;

/** Mehr Dunglinge trägt der Schwarm nicht. */
export const MAX_DUNGLINGS = 6;

export function buildingDef(type) {
  return BUILDING_DEFS[type] ?? null;
}

export function canAfford(essence, type) {
  const def = buildingDef(type);
  return Boolean(def) && essence >= def.cost;
}
