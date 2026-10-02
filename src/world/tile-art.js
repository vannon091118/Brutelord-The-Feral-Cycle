import { createRng } from '../domain/world/random.js';
import { EARTH_VARIANT_COUNT, TILE_SIZE } from '../domain/world/world-config.js';
import { blobFromSeed, chipFromRim, crackFromRim, blobPath, blobPoints, round } from './hand.js';

const TILE_RIM = TILE_SIZE / 2 - 2.5;

/** Earth tone sets: four tone values per variant, all earthy, none glossy. */
const EARTH_PALETTES = [
  { deep: '#33210f', base: '#6b4a2c', mid: '#7d5836', light: '#906a43', edge: '#2a1a0d' },
  { deep: '#2f1f10', base: '#66472b', mid: '#775536', light: '#896641', edge: '#28190c' },
  { deep: '#37230f', base: '#70502f', mid: '#825f39', light: '#977147', edge: '#2c1c0c' },
  { deep: '#2c1d0f', base: '#614530', mid: '#715234', light: '#83643f', edge: '#241709' },
  { deep: '#3a2511', base: '#73512e', mid: '#856138', light: '#9a7247', edge: '#2e1d0b' },
];



function buildEarthVariant(index) {
  const seed = `earth:${index}`;
  const rng = createRng(seed);
  const palette = EARTH_PALETTES[index % EARTH_PALETTES.length];

  const silhouette = blobPath(blobPoints(rng, 0, 0, TILE_RIM, 10, 0.3));
  const topMass = blobFromSeed(`${seed}:top`, -4, -7, TILE_RIM * 0.58, 8, 0.32, 0.72);
  const lowMass = blobFromSeed(`${seed}:low`, 7, 9, TILE_RIM * 0.46, 7, 0.34, 0.7);
  const coreMass = blobFromSeed(`${seed}:core`, 2, 1, TILE_RIM * 0.34, 6, 0.3);

  const pebbles = [];
  const pebbleCount = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < pebbleCount; i += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = rng() * TILE_RIM * 0.66;
    pebbles.push({
      cx: round(Math.cos(angle) * radius),
      cy: round(Math.sin(angle) * radius * 0.9),
      rx: round(1.6 + rng() * 2.6),
      ry: round(1.1 + rng() * 1.6),
      tone: rng() > 0.5 ? palette.light : palette.deep,
      opacity: round(0.35 + rng() * 0.35),
    });
  }

  // Damage: two primary cracks appear when touched, four more when critical.
  const primaryCracks = [];
  const primaryAngles = [];
  for (let i = 0; i < 2; i += 1) {
    const angle = rng() * Math.PI * 2;
    primaryAngles.push(angle);
    primaryCracks.push(
      crackFromRim(rng, 0, 0, TILE_RIM * 0.9, angle, TILE_RIM * (0.28 + rng() * 0.14)),
    );
  }

  const deepCracks = [...primaryCracks];
  for (let i = 0; i < 4; i += 1) {
    const angle = rng() * Math.PI * 2;
    deepCracks.push(
      crackFromRim(rng, 0, 0, TILE_RIM * (0.5 + rng() * 0.35), angle, TILE_RIM * (0.2 + rng() * 0.16)),
    );
  }

  const chips = [];
  for (let i = 0; i < 3; i += 1) {
    const angle = rng() * Math.PI * 2;
    chips.push(chipFromRim(rng, 0, 0, TILE_RIM * 0.94, angle));
  }

  // Dust that sits on the surface, gives the tile some grain.
  const dust = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = rng() * TILE_RIM * 0.5;
    dust.push({
      cx: round(Math.cos(angle) * radius),
      cy: round(Math.sin(angle) * radius),
      r: round(0.5 + rng() * 1.1),
      opacity: round(0.15 + rng() * 0.3),
    });
  }

  return {
    palette,
    silhouette,
    topMass,
    lowMass,
    coreMass,
    pebbles,
    cracks: primaryCracks,
    deepCracks,
    chips,
    dust,
  };
}

export const EARTH_ART = Array.from({ length: EARTH_VARIANT_COUNT }, (_, index) =>
  buildEarthVariant(index),
);

/** Free dungeon floor - the reward for a dug out tile. */
export const FLOOR_ART = (() => {
  const seed = 'floor:0';
  const rng = createRng(seed);
  const silhouette = blobPath(blobPoints(rng, 0, 0, TILE_RIM + 0.5, 9, 0.16));
  const inner = blobFromSeed(`${seed}:inner`, 0, 1, TILE_RIM * 0.62, 8, 0.22);
  const flags = [];
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    flags.push({
      x: round(Math.cos(angle) * TILE_RIM * 0.72),
      y: round(Math.sin(angle) * TILE_RIM * 0.72),
    });
  }
  const specks = [];
  for (let i = 0; i < 7; i += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = rng() * TILE_RIM * 0.55;
    specks.push({
      cx: round(Math.cos(angle) * radius),
      cy: round(Math.sin(angle) * radius),
      r: round(0.6 + rng() * 1.3),
      opacity: round(0.12 + rng() * 0.22),
    });
  }
  return { silhouette, inner, flags, specks };
})();

