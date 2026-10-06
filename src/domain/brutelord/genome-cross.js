// @doc: docs/daten/brutelord/genome-cross.md#genome-cross
import { GENE_LOCI, GENOME_CONFIG, GENOME_SALT, LOCUS_ORDER } from './genome-config.js';
import { mixSeed, unitOf } from './stone-seed.js';

function locusSalt(locus, offset = 0) {
  return GENOME_SALT.cross + LOCUS_ORDER.indexOf(locus) * 89 + offset;
}

function pick(pair, seed, salt) {
  return unitOf(mixSeed(seed, salt)) < 0.5 ? pair[0] : pair[1];
}

function alleleFrom(locus, seed, salt) {
  const count = GENE_LOCI[locus].values.length;
  return Math.floor(unitOf(mixSeed(seed, salt)) * count);
}

function mutateOne({ allele, locus, seed, salt }) {
  if (unitOf(mixSeed(seed, salt)) >= GENOME_CONFIG.mutationPerMille / 1000) return allele;
  return alleleFrom(locus, seed, salt + 1);
}

function crossOne({ mother, father, locus, seed }) {
  return [pick(mother[locus], seed, locusSalt(locus)), pick(father[locus], seed, locusSalt(locus, 17))];
}

export function crossGenome(mother, father, seed) {
  return Object.fromEntries(LOCUS_ORDER.map((locus) => [locus, crossOne({ mother, father, locus, seed })]));
}

export function mutateGenome(genome, seed) {
  return Object.fromEntries(
    LOCUS_ORDER.map((locus) => {
      const pair = genome[locus];
      const salt = GENOME_SALT.mutation + LOCUS_ORDER.indexOf(locus) * 53;
      const first = mutateOne({ allele: pair[0], locus, seed, salt });
      return [locus, [first, mutateOne({ allele: pair[1], locus, seed, salt: salt + 29 })]];
    }),
  );
}
