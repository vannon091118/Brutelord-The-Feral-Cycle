// @doc: docs/daten/brutelord/genome-roll.md#genome-roll
import { GENE_LOCI, GENOME_SALT, LOCUS_ORDER } from './genome-config.js';
import { mixSeed, pickFrom, unitOf } from './stone-seed.js';

function locusSalt(locus, offset = 0) {
  return GENOME_SALT.allele + LOCUS_ORDER.indexOf(locus) * 37 + offset;
}

function pairFor(seed, locus) {
  const count = GENE_LOCI[locus].values.length;
  return [pickFrom(seed, locusSalt(locus), count), pickFrom(seed, locusSalt(locus, 11), count)];
}

export function createGenome(seed) {
  return Object.fromEntries(LOCUS_ORDER.map((locus) => [locus, pairFor(seed, locus)]));
}

export function expressed(genome, locus) {
  return Math.max(genome[locus][0], genome[locus][1]);
}

export function carried(genome, locus) {
  return Math.min(genome[locus][0], genome[locus][1]);
}

export function fairExpressed(genome, locus) {
  const [first, second] = genome[locus];
  if (first === second) return first;
  const salt = GENOME_SALT.fair + LOCUS_ORDER.indexOf(locus) * 37;
  return unitOf(mixSeed(genomeHash(genome), salt)) < 0.5 ? first : second;
}

export function genomeHash(genome) {
  return LOCUS_ORDER.reduce(
    (hash, locus) => mixSeed(hash ^ (genome[locus][0] + 1), GENOME_SALT.allele + genome[locus][1] * 131),
    0x9e3779b9,
  );
}
