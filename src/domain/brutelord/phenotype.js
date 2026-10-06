// @doc: docs/daten/brutelord/phenotype.md#phenotype
import { GENE_LOCI, GENOME_CONFIG, LOCUS_MODE, PHENOTRAIT_MAP } from './genome-config.js';
import { carried, expressed, genomeHash } from './genome-roll.js';

function locusValue(genome, locus) {
  const spec = GENE_LOCI[locus];
  const dominant = spec.values[expressed(genome, locus)];
  if (spec.mode === LOCUS_MODE.DOMINANT) return dominant;
  return (dominant + spec.values[carried(genome, locus)]) / 2;
}

function traitValue(genome, trait) {
  const sources = PHENOTRAIT_MAP[trait];
  return Object.keys(sources).reduce(
    (sum, locus) => sum + locusValue(genome, locus) * sources[locus],
    0,
  );
}

function traitsOf(genome) {
  return Object.fromEntries(Object.keys(PHENOTRAIT_MAP).map((trait) => [trait, traitValue(genome, trait)]));
}

function hpOf(genome) {
  return Math.round(GENOME_CONFIG.hpBase + traitValue(genome, 'vitality') * GENOME_CONFIG.hpPerPoint);
}

export function phenotypeOf(genome) {
  return {
    hash: genomeHash(genome),
    traits: traitsOf(genome),
    species: locusValue(genome, 'SPECIES'),
    skin: locusValue(genome, 'SKIN'),
    eyes: Math.round(locusValue(genome, 'EYE_COUNT')),
    horns: Math.round(locusValue(genome, 'HORN')),
    vitals: { hp: hpOf(genome) },
  };
}
