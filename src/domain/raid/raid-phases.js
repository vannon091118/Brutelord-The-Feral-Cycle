// @doc: docs/daten/raid/raid-phases.md#raid-phases
const ACTION = Object.freeze({ MOVE: 'MOVE', DIG: 'DIG', ATTACK: 'ATTACK', SACRIFICE: 'SACRIFICE', LOOT: 'LOOT', NONE: 'NONE' });

const LEER = Object.freeze([]);

function frozenActions(...namen) {
  return Object.freeze(namen.map((name) => ACTION[name]));
}

export const RAID_PHASE = Object.freeze({
  ENTER: 'ENTER',
  COMBAT: 'COMBAT',
  WARDEN_DOWN: 'WARDEN_DOWN',
  SACRIFICE: 'SACRIFICE',
  LOOT: 'LOOT',
  EXTRACTING: 'EXTRACTING',
  RESOLVED: 'RESOLVED',
});

export const RAID_EVENT = Object.freeze({
  ENTERED_HIVE: 'ENTERED_HIVE',
  WARDEN_FELL: 'WARDEN_FELL',
  SACRIFICED: 'SACRIFICED',
  LOOT_TAKEN: 'LOOT_TAKEN',
  EXTRACTED: 'EXTRACTED',
  RAID_LOST: 'RAID_LOST',
});

export const RAID_PHASE_ACTIONS = Object.freeze({
  [RAID_PHASE.ENTER]: frozenActions('MOVE', 'DIG', 'ATTACK'),
  [RAID_PHASE.COMBAT]: frozenActions('ATTACK', 'MOVE'),
  [RAID_PHASE.WARDEN_DOWN]: frozenActions('MOVE', 'SACRIFICE', 'LOOT'),
  [RAID_PHASE.SACRIFICE]: frozenActions('SACRIFICE', 'LOOT'),
  [RAID_PHASE.LOOT]: frozenActions('MOVE', 'DIG'),
  [RAID_PHASE.EXTRACTING]: frozenActions('MOVE', 'DIG'),
  [RAID_PHASE.RESOLVED]: frozenActions('NONE'),
});

const RAID_STAMINA_COST = Object.freeze({
  ENTERED_HIVE: 2,
  WARDEN_FELL: 4,
  SACRIFICED: 6,
  LOOT_TAKEN: 3,
  EXTRACTED: 1,
  RAID_LOST: 0,
});

function edge(event, to) {
  return Object.freeze({ event, to, staminaCost: RAID_STAMINA_COST[event], actions: RAID_PHASE_ACTIONS[to] });
}

export const RAID_TRANSITIONS = Object.freeze({
  [RAID_PHASE.ENTER]: Object.freeze([
    edge(RAID_EVENT.ENTERED_HIVE, RAID_PHASE.COMBAT),
    edge(RAID_EVENT.RAID_LOST, RAID_PHASE.RESOLVED),
  ]),
  [RAID_PHASE.COMBAT]: Object.freeze([
    edge(RAID_EVENT.WARDEN_FELL, RAID_PHASE.WARDEN_DOWN),
    edge(RAID_EVENT.RAID_LOST, RAID_PHASE.RESOLVED),
  ]),
  [RAID_PHASE.WARDEN_DOWN]: Object.freeze([
    edge(RAID_EVENT.SACRIFICED, RAID_PHASE.SACRIFICE),
    edge(RAID_EVENT.LOOT_TAKEN, RAID_PHASE.LOOT),
    edge(RAID_EVENT.RAID_LOST, RAID_PHASE.RESOLVED),
  ]),
  [RAID_PHASE.SACRIFICE]: Object.freeze([
    edge(RAID_EVENT.LOOT_TAKEN, RAID_PHASE.LOOT),
    edge(RAID_EVENT.SACRIFICED, RAID_PHASE.SACRIFICE),
    edge(RAID_EVENT.RAID_LOST, RAID_PHASE.RESOLVED),
  ]),
  [RAID_PHASE.LOOT]: Object.freeze([
    edge(RAID_EVENT.EXTRACTED, RAID_PHASE.EXTRACTING),
    edge(RAID_EVENT.RAID_LOST, RAID_PHASE.RESOLVED),
  ]),
  [RAID_PHASE.EXTRACTING]: Object.freeze([
    edge(RAID_EVENT.EXTRACTED, RAID_PHASE.RESOLVED),
    edge(RAID_EVENT.RAID_LOST, RAID_PHASE.RESOLVED),
  ]),
  [RAID_PHASE.RESOLVED]: Object.freeze([]),
});

export function actionsAllowedIn(phase) {
  return RAID_PHASE_ACTIONS[phase] ?? LEER;
}

export function isTerminal(phase) {
  const kanten = RAID_TRANSITIONS[phase];
  return kanten !== undefined && kanten.length === 0;
}

export function advance(phase, event) {
  const kanten = RAID_TRANSITIONS[phase];
  if (kanten === undefined) return { ok: false, error: 'UNBEKANNTE_PHASE' };
  if (kanten.length === 0) return { ok: false, error: 'RAID_BEREITS_AUFGELOEST' };
  if (!Object.hasOwn(RAID_EVENT, event)) return { ok: false, error: 'UNBEKANNTER_EVENT' };
  const kante = kanten.find((candidate) => candidate.event === event);
  if (kante === undefined) return { ok: false, error: 'VERBOTENER_UEBERGANG' };
  return { ok: true, phase, to: kante.to, staminaCost: kante.staminaCost };
}

export function phasePath() {
  const pfad = [RAID_PHASE.ENTER];
  while (!isTerminal(pfad.at(-1))) {
    const weiter = (RAID_TRANSITIONS[pfad.at(-1)] ?? LEER)[0];
    if (weiter === undefined || pfad.includes(weiter.to)) break;
    pfad.push(weiter.to);
  }
  return Object.freeze(pfad);
}
