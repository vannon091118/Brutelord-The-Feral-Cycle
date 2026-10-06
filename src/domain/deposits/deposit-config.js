// @doc: docs/daten/deposits/deposit-config.md#deposit-config
export const DEPOSIT_PHASE = Object.freeze({
  BURIED: 'BURIED',
  HINTED: 'HINTED',
  FOUND: 'FOUND',
  SPENT: 'SPENT',
});

export const DEPOSIT_CONFIG = Object.freeze({
  blockStride: 4,
  innerInset: 1,
  sizeMin: 1,
  sizeMax: 3,
  capacityPerTile: 40,
  capacityPerExtraTile: 20,
  capacityMax: 100,
  skipPerMille: 350,
  hiveExclusion: 6,
});

export const ESSENCE_STAGE = Object.freeze({
  RICH: 'RICH',
  MEDIUM: 'MEDIUM',
  LEAN: 'LEAN',
  DEAD: 'DEAD',
});

export const STAGE_MIN_SHARE = Object.freeze({
  RICH: 0.75,
  MEDIUM: 0.25,
  LEAN: 0.01,
  DEAD: 0,
});

export const CLUSTER_COUNT_MIN = 120;
export const CLUSTER_COUNT_MAX = 200;
const WORLD_ESSENCE_BUDGET = 8860;
const WORLD_ESSENCE_TOLERANCE = 0.25;export const DEPOSIT_KIND = Object.freeze({
  REICHE_ADER: 'REICHE_ADER',
  TIEFER_VORRAT: 'TIEFER_VORRAT',
  NEST: 'NEST',
  VERDORBEN: 'VERDORBEN',
  SELTSAMER_STEIN: 'SELTSAMER_STEIN',
});

export const DEPOSIT_KIND_LABEL = Object.freeze({
  [DEPOSIT_KIND.REICHE_ADER]: 'Reiche Ader',
  [DEPOSIT_KIND.TIEFER_VORRAT]: 'Tiefer Vorrat',
  [DEPOSIT_KIND.NEST]: 'Nest',
  [DEPOSIT_KIND.VERDORBEN]: 'Verdorbener Bereich',
  [DEPOSIT_KIND.SELTSAMER_STEIN]: 'Seltsamer Stein',
});

export const DEPOSIT_RISK_CLASS = Object.freeze({
  GERING: 'GERING',
  MITTEL: 'MITTEL',
  HOCH: 'HOCH',
  UNBEKANNT: 'UNBEKANNT',
});

export const DEPOSIT_KIND_DEFS = Object.freeze({
  [DEPOSIT_KIND.REICHE_ADER]: Object.freeze({
    label: DEPOSIT_KIND_LABEL[DEPOSIT_KIND.REICHE_ADER],
    riskClass: DEPOSIT_RISK_CLASS.GERING,
    riskText: 'Nah am Hive, schwer zu erreichen — aber große Belohnung, wenn du ran kommst.',
    reward: 'grosseReichhaltigkeit',
    hazard: null,
    unknown: false,
  }),
  [DEPOSIT_KIND.TIEFER_VORRAT]: Object.freeze({
    label: DEPOSIT_KIND_LABEL[DEPOSIT_KIND.TIEFER_VORRAT],
    riskClass: DEPOSIT_RISK_CLASS.MITTEL,
    riskText: 'Weit vom Hive entfernt, aber sehr wertvoll — der Weg kostet Zeit, nicht nur Essenz.',
    reward: 'hoheKapazitaet',
    hazard: 'entfernung',
    unknown: false,
  }),
  [DEPOSIT_KIND.NEST]: Object.freeze({
    label: DEPOSIT_KIND_LABEL[DEPOSIT_KIND.NEST],
    riskClass: DEPOSIT_RISK_CLASS.HOCH,
    riskText: 'Ressource plus Gefahr — wer hier abbbaut, gibt etwas anderes frei.',
    reward: 'mittlereReichhaltigkeit',
    hazard: 'nerven',
    unknown: false,
  }),
  [DEPOSIT_KIND.VERDORBEN]: Object.freeze({
    label: DEPOSIT_KIND_LABEL[DEPOSIT_KIND.VERDORBEN],
    riskClass: DEPOSIT_RISK_CLASS.HOCH,
    riskText: 'Ressource mit negativen Effekten auf Arbeiter — die Ernte lohnt sich, zählt aber den Preis.',
    reward: 'mittlereReichhaltigkeit',
    hazard: 'dunglingSchwach',
    unknown: false,
  }),
  [DEPOSIT_KIND.SELTSAMER_STEIN]: Object.freeze({
    label: DEPOSIT_KIND_LABEL[DEPOSIT_KIND.SELTSAMER_STEIN],
    riskClass: DEPOSIT_RISK_CLASS.UNBEKANNT,
    riskText: 'Ein unbekannter Gegenstand mit potenziell großer Wirkung — man weiß erst, was man hat, wenn man ihn hebt.',
    reward: 'unbekannt',
    hazard: 'unbekannt',
    unknown: true,
  }),
});

export const DEPOSIT_KIND_ORDER = Object.freeze([
  DEPOSIT_KIND.REICHE_ADER,
  DEPOSIT_KIND.TIEFER_VORRAT,
  DEPOSIT_KIND.NEST,
  DEPOSIT_KIND.VERDORBEN,
  DEPOSIT_KIND.SELTSAMER_STEIN,
]);

export const DEPOSIT_DEPTH = Object.freeze({ gainPerFloor: 0.25 });
export function depthGain(depth = 0) {
  return Number.isInteger(depth) && depth > 0 ? depth * DEPOSIT_DEPTH.gainPerFloor : 0;
}
export function capacityAtDepth(capacity, depth = 0) {
  return Math.round(capacity * (1 + depthGain(depth)));
}
export function capacityCeilingFor(depth = 0) {
  return capacityAtDepth(DEPOSIT_CONFIG.capacityMax, depth);
}
export function essenceBudget(depth = 0) {
  const growth = 1 + depthGain(depth);
  return {
    floor: Math.round(WORLD_ESSENCE_BUDGET * (1 - WORLD_ESSENCE_TOLERANCE) * growth),
    ceiling: Math.round(WORLD_ESSENCE_BUDGET * (1 + WORLD_ESSENCE_TOLERANCE) * growth),
  };
}
export function hiveDistance({ x, y, hiveOrigin, hiveSize }) {
  const dx = Math.max(hiveOrigin.x - x, x - (hiveOrigin.x + hiveSize.width - 1), 0);
  const dy = Math.max(hiveOrigin.y - y, y - (hiveOrigin.y + hiveSize.height - 1), 0);
  return Math.max(dx, dy);
}

const DEPOSIT_REWARD_BY_KIND = Object.freeze({
  [DEPOSIT_KIND.REICHE_ADER]: 1.4,
  [DEPOSIT_KIND.TIEFER_VORRAT]: 1.7,
  [DEPOSIT_KIND.NEST]: 0.9,
  [DEPOSIT_KIND.VERDORBEN]: 0.7,
  [DEPOSIT_KIND.SELTSAMER_STEIN]: 1,
});

export function depositRewardMultiplier(kind) {
  return DEPOSIT_REWARD_BY_KIND[kind] ?? 1;
}

