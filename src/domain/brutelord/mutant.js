// @doc: docs/daten/brutelord/mutant.md#mutant
import { placedStones } from './lab-state.js';
import { MUTANT_CONFIG, STONE_CONFIG } from './stone-config.js';
import { GENOME_SALT } from './genome-config.js';
import { createGenome, genomeHash } from './genome-roll.js';
import { crossGenome, mutateGenome } from './genome-cross.js';
import { mixSeed } from './stone-seed.js';
import { idle } from '../entities/dungling.js';

export function unitStones(worker) {
  return worker.stones ?? [];
}

export function isMutant(worker) {
  return Boolean(worker.genome) || unitStones(worker).length > 0;
}

export function fusionStones(lab) {
  return placedStones(lab);
}

export function investedIn(stones) {
  return stones.length * STONE_CONFIG.cost;
}

export function nextCandidate(dunglings) {
  const free = dunglings.filter((worker) => !isMutant(worker));
  return free.find((worker) => !worker.job) ?? free[0] ?? null;
}

export function genomeForStones(stones) {
  return createGenome(stones.reduce((acc, stone) => mixSeed(acc, stone.seed), 0x5eed));
}

export function genomeOf(worker) {
  return worker.genome ?? genomeForStones(unitStones(worker));
}

export function fuse(worker, stones) {
  if (stones.length === 0 || isMutant(worker)) return null;
  return { ...worker, stones, genome: genomeForStones(stones), invested: investedIn(stones), battleEp: 0 };
}

export function refundFor(worker) {
  const veteran = (worker.battleEp ?? 0) >= MUTANT_CONFIG.veteranEp;
  const rate = veteran ? MUTANT_CONFIG.refundVeteran : MUTANT_CONFIG.refundUnused;
  return Math.floor((worker.invested ?? 0) * rate);
}

export function asBase(worker) {
  return { ...worker, stones: [], genome: null, invested: 0, battleEp: 0 };
}

export function breedSeed(mother, father) {
  return mixSeed(genomeHash(mother.genome), genomeHash(father.genome));
}

export function breed(mother, father, seed) {
  if (!mother?.genome || !father?.genome) return null;
  const crossed = crossGenome(mother.genome, father.genome, seed);
  const genome = mutateGenome(crossed, mixSeed(seed, GENOME_SALT.mutation));
  const childId = `dungling-${genomeHash(genome).toString(16)}`;
  return { ...idle(asBase(mother)), id: childId, genome, job: null };
}
