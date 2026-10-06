// @doc: docs/daten/brutelord/genome-config.md#genome-config
export const LOCUS_MODE = Object.freeze({
  DOMINANT: 'DOMINANT',
  ADDITIVE: 'ADDITIVE',
});

export const SKIN_TEXTURE = Object.freeze({
  FLESH: 'FLESH',
  CHITIN: 'CHITIN',
  SLIME: 'SLIME',
  BONE: 'BONE',
});

export const FEATURE_ANCHOR = Object.freeze({
  HEAD_TIP: 'HEAD_TIP',
  EYE_SOCKET: 'EYE_SOCKET',
  JAW: 'JAW',
  LIMB_TIP: 'LIMB_TIP',
  BACK: 'BACK',
});

export const GENE_LOCI = Object.freeze({
  LIMB_LEN: Object.freeze({ mode: LOCUS_MODE.ADDITIVE, values: Object.freeze([0.8, 1, 1.2, 1.45]) }),
  LIMB_THICK: Object.freeze({ mode: LOCUS_MODE.ADDITIVE, values: Object.freeze([0.7, 0.9, 1.1, 1.3]) }),
  LIMB_CURL: Object.freeze({ mode: LOCUS_MODE.ADDITIVE, values: Object.freeze([-0.3, -0.1, 0.15, 0.35]) }),
  SPINE: Object.freeze({ mode: LOCUS_MODE.ADDITIVE, values: Object.freeze([0.85, 1, 1.15, 1.3]) }),
  HEAD_SIZE: Object.freeze({ mode: LOCUS_MODE.ADDITIVE, values: Object.freeze([0.8, 0.95, 1.15, 1.35]) }),
  VITALITY: Object.freeze({ mode: LOCUS_MODE.ADDITIVE, values: Object.freeze([0.8, 1, 1.2, 1.4]) }),
  EYE_COUNT: Object.freeze({ mode: LOCUS_MODE.DOMINANT, values: Object.freeze([1, 2, 3, 4]) }),
  HORN: Object.freeze({ mode: LOCUS_MODE.DOMINANT, values: Object.freeze([0, 1, 2, 3]) }),
  SKIN: Object.freeze({
    mode: LOCUS_MODE.DOMINANT,
    values: Object.freeze([SKIN_TEXTURE.FLESH, SKIN_TEXTURE.CHITIN, SKIN_TEXTURE.SLIME, SKIN_TEXTURE.BONE]),
  }),
});

export const LOCUS_ORDER = Object.freeze(Object.keys(GENE_LOCI));

export const PHENOTRAIT_MAP = Object.freeze({
  limbLength: Object.freeze({ LIMB_LEN: 1, SPINE: 0.3 }),
  limbThickness: Object.freeze({ LIMB_THICK: 1, VITALITY: 0.2 }),
  limbCurl: Object.freeze({ LIMB_CURL: 1 }),
  bodyScale: Object.freeze({ SPINE: 1, VITALITY: 0.25 }),
  headScale: Object.freeze({ HEAD_SIZE: 1 }),
  vitality: Object.freeze({ VITALITY: 1, SPINE: 0.15, LIMB_THICK: 0.1 }),
});

export const GENOME_SALT = Object.freeze({
  allele: 6131,
  cross: 8117,
  mutation: 2179,
});

export const GENOME_CONFIG = Object.freeze({
  mutationPerMille: 12,
  hpBase: 10,
  hpPerPoint: 4,
});

export const ORGANIC_SALT = Object.freeze({
  plan: 3301,
  spine: 4517,
  limb: 5507,
  head: 6211,
});

export const ORGANIC_CONFIG = Object.freeze({
  phaseCount: 4,
  phaseMs: 420,
  breathe: Object.freeze([1, 1.06, 1.1, 1.04]),
  spineNodes: 3,
  spineLength: 0.42,
  tailLength: 0.46,
  bodyGirth: 0.15,
  limbSplay: 0.62,
  limbLength: 0.8,
  limbGirth: 0.1,
  headRadius: 0.34,
  jointBulge: 1.3,
  limbRoot: 1,
  limbPinch: 0.35,
  limbJoint: 1.7,
  featureGirth: 0.07,
  iso: 1,
  cell: 0.09,
  pad: 0.7,
  sealRounds: 8,
  ringMinPoints: 8,
  ringMinArea: 0.02,
});
