// @doc: docs/daten/brutelord/stone-config.md#stone-config
export const STONE_RARITY = Object.freeze({
  NORMAL: 'NORMAL',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY',
});

export const STONE_DEFS = Object.freeze({
  [STONE_RARITY.NORMAL]: Object.freeze({
    label: 'Normal',
    tone: 'grau',
    statCount: 1,
    traitChance: 0.05,
    capabilityChance: 0.15,
    power: 1,
  }),
  [STONE_RARITY.RARE]: Object.freeze({
    label: 'Selten',
    tone: 'blau',
    statCount: 2,
    traitChance: 0.15,
    capabilityChance: 0.35,
    power: 2,
  }),
  [STONE_RARITY.EPIC]: Object.freeze({
    label: 'Episch',
    tone: 'lila',
    statCount: 3,
    traitChance: 0.35,
    capabilityChance: 0.6,
    power: 3,
  }),
  [STONE_RARITY.LEGENDARY]: Object.freeze({
    label: 'Legendär',
    tone: 'gold',
    statCount: 4,
    traitChance: 0.75,
    capabilityChance: 0.9,
    power: 4,
  }),
});

export const RAID_CAPABILITY = Object.freeze({
  DIG: 'DIG',
});

export const RAID_CAPABILITY_DEFS = Object.freeze({
  [RAID_CAPABILITY.DIG]: Object.freeze({
    label: 'Graben',
    text: 'Bricht durch Stein und Obsidian, im eigenen Dungeon wie im Raid.',
  }),
});

export const RARITY_ORDER = Object.freeze([
  STONE_RARITY.NORMAL,
  STONE_RARITY.RARE,
  STONE_RARITY.EPIC,
  STONE_RARITY.LEGENDARY,
]);

export const RARITY_WEIGHTS = Object.freeze([60, 26, 11, 3]);

export const STONE_TRAIT = Object.freeze({
  GREEDY: 'GREEDY',
  MOTIVATOR: 'MOTIVATOR',
  SLIMY: 'SLIMY',
});

export const STONE_TRAIT_DEFS = Object.freeze({
  [STONE_TRAIT.GREEDY]: Object.freeze({
    label: 'Gierig',
    text: 'Trägt doppelt so viel Essenz, verweigert aber Bauaufträge.',
    buildOrders: false,
    carryBonus: 1,
    auraRadius: 0,
    speedBonus: 0,
    trailSlow: 0,
  }),
  [STONE_TRAIT.MOTIVATOR]: Object.freeze({
    label: 'Motivator',
    text: 'Eine Aura beschleunigt alle Einheiten im Umkreis.',
    buildOrders: true,
    carryBonus: 0,
    auraRadius: 3,
    speedBonus: 0.25,
    trailSlow: 0,
  }),
  [STONE_TRAIT.SLIMY]: Object.freeze({
    label: 'Schleimig',
    text: 'Hinterlässt eine Kriechspur, die alles verlangsamt.',
    buildOrders: true,
    carryBonus: 0,
    auraRadius: 0,
    speedBonus: 0,
    trailSlow: 0.5,
  }),
});

export const TRAIT_ORDER = Object.freeze([STONE_TRAIT.GREEDY, STONE_TRAIT.MOTIVATOR, STONE_TRAIT.SLIMY]);

export const STONE_SLOT = Object.freeze({
  HEAD: 'HEAD',
  TORSO: 'TORSO',
  ARMS: 'ARMS',
  LEGS: 'LEGS',
});

export const SLOT_ORDER = Object.freeze([STONE_SLOT.HEAD, STONE_SLOT.TORSO, STONE_SLOT.ARMS, STONE_SLOT.LEGS]);

export const STONE_CONFIG = Object.freeze({
  pityLimit: 30,
  pityStep: 0.02,
  pityMaxBonus: 0.5,
  cost: 4,
  inventoryMax: 12,
});

export const MUTANT_CONFIG = Object.freeze({
  refundUnused: 0.5,
  refundVeteran: 0.8,
  veteranEp: 1,
});