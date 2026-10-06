/** Die Mendelsche Vererbung: Genom, Dominanz, Kreuzung, Polygenie — ohne UI. */
import { GENE_LOCI, GENOME_CONFIG, LOCUS_MODE, PHENOTRAIT_MAP, SPECIES } from '../../src/domain/brutelord/genome-config.js';
import { carried, createGenome, expressed, fairExpressed, genomeHash } from '../../src/domain/brutelord/genome-roll.js';
import { crossGenome, mutateGenome } from '../../src/domain/brutelord/genome-cross.js';
import { phenotypeOf, speciesOf } from '../../src/domain/brutelord/phenotype.js';
import { check, section } from './expect.mjs';

const LOCI = Object.keys(GENE_LOCI);
const FAIR_SAMPLE = Array.from({ length: 400 }, (unused, index) => createGenome(index * 7919 + 3));

function uniform(allele) {
  return Object.fromEntries(LOCI.map((locus) => [locus, [allele, allele]]));
}

function withPair(genome, locus, pair) {
  return { ...genome, [locus]: pair };
}

function vitalityBand() {
  return Object.entries(PHENOTRAIT_MAP.vitality).reduce(
    (band, [locus, weight]) => {
      const values = GENE_LOCI[locus].values;
      return { min: band.min + Math.min(...values) * weight, max: band.max + Math.max(...values) * weight };
    },
    { min: 0, max: 0 },
  );
}

function checkDeterminism() {
  section('Genom: Determinismus');
  const first = createGenome(12345);
  check('Derselbe Seed ergibt dasselbe Genom', JSON.stringify(first) === JSON.stringify(createGenome(12345)));
  check('Ein anderer Seed ergibt ein anderes Genom', JSON.stringify(createGenome(999)) !== JSON.stringify(first));
  check('Jeder Locus traegt genau zwei Allele', LOCI.every((locus) => first[locus].length === 2));
  check(
    'Jedes Allel liegt im Wertebereich',
    LOCI.every((locus) =>
      first[locus].every((allele) => Number.isInteger(allele) && allele >= 0 && allele < GENE_LOCI[locus].values.length),
    ),
  );
  check('Der Genom-Hash ist stabil', genomeHash(first) === genomeHash(createGenome(12345)));
  check('Die Mutation ist reproduzierbar', JSON.stringify(mutateGenome(first, 99)) === JSON.stringify(mutateGenome(first, 99)));
  const moved = Array.from({ length: 400 }, (unused, index) => JSON.stringify(mutateGenome(first, index)) !== JSON.stringify(first));
  check('Die Mutation greift mit der Rate der Config', moved.filter(Boolean).length / moved.length > 0.05);
}

function checkDominance() {
  section('Genom: Dominanz');
  const locus = 'EYE_COUNT';
  check('Der Locus ist dominant', GENE_LOCI[locus].mode === LOCUS_MODE.DOMINANT);
  const hybrid = withPair(uniform(0), locus, [3, 0]);
  check('Das dominante Allel setzt sich durch', expressed(hybrid, locus) === 3);
  check('Das rezessive Allel bleibt vorhanden', carried(hybrid, locus) === 0);
  check('Die Reihenfolge im Paar kippt die Dominanz nicht', expressed(withPair(uniform(0), locus, [0, 3]), locus) === 3);
  const recessive = withPair(uniform(0), locus, [0, 0]);
  check('Ohne dominantes Allel zeigt sich das rezessive', expressed(recessive, locus) === 0);
  check('Der Phaenotyp folgt dem ausgedrueckten Allel', phenotypeOf(recessive).eyes === GENE_LOCI[locus].values[0]);
}

function checkSegregation() {
  section('Genom: Mendel-Spaltung');
  const mother = uniform(3);
  const father = uniform(0);
  const children = Array.from({ length: 40 }, (unused, index) => crossGenome(mother, father, 5000 + index * 131));
  check(
    'Jedes Kind traegt ein Allel von jedem Elternteil',
    children.every((child) => LOCI.every((locus) => child[locus].includes(3) && child[locus].includes(0))),
  );
  check(
    'Kein fremdes Allel entsteht in der Kreuzung',
    children.every((child) => LOCI.every((locus) => child[locus].every((allele) => allele === 0 || allele === 3))),
  );
}

function checkRecessive() {
  section('Genom: rezessiv mitgeschleppt');
  const locus = 'EYE_COUNT';
  const hybrid = withPair(uniform(3), locus, [3, 0]);
  const children = Array.from({ length: 800 }, (unused, index) => crossGenome(hybrid, hybrid, 9300 + index * 71));
  const hidden = children.filter((child) => child[locus][0] === 0 && child[locus][1] === 0).length / children.length;
  check('Zwei Traeger zeigen das Rezessive in etwa einem Viertel', hidden > 0.18 && hidden < 0.32, `${(hidden * 100).toFixed(1)}%`);
  const toDominant = Array.from({ length: 400 }, (unused, index) => crossGenome(hybrid, uniform(3), 3900 + index * 37));
  const carriers = toDominant.filter((child) => child[locus].includes(0)).length / toDominant.length;
  check('Gegen einen reinerbigen Partner traegt die Haelfte das Rezessive', carriers > 0.35 && carriers < 0.65, `${(carriers * 100).toFixed(1)}%`);
  check('Aber es wird nicht ausgedrueckt', toDominant.every((child) => expressed(child, locus) !== 0));
}

function checkPolygeny() {
  section('Genom: Polygenie');
  check('Ein Merkmal haengt an mehreren Loci', Object.keys(PHENOTRAIT_MAP.vitality).length >= 2);
  const base = uniform(1);
  const strong = withPair(base, 'VITALITY', [3, 3]);
  const spine = withPair(base, 'SPINE', [3, 3]);
  const value = (genome) => phenotypeOf(genome).traits.vitality;
  check('Der eine Locus verschiebt das Merkmal', value(strong) > value(base), `${value(base)} -> ${value(strong)}`);
  check('Der andere Locus verschiebt dasselbe Merkmal', value(spine) > value(base), `${value(base)} -> ${value(spine)}`);
  const both = withPair(strong, 'SPINE', [3, 3]);
  const additive = Math.abs(value(strong) + value(spine) - value(base) - value(both));
  check('Die Wirkungen addieren sich', additive < 1e-9, `Abweichung ${additive}`);
  check('Der Phaenotyp ist reproduzierbar', value(base) === value(uniform(1)));
}

function checkHpBand() {
  section('Genom: HP ueber viele Generationen');
  const band = vitalityBand();
  const lowest = Math.floor(GENOME_CONFIG.hpBase + band.min * GENOME_CONFIG.hpPerPoint);
  const highest = Math.ceil(GENOME_CONFIG.hpBase + band.max * GENOME_CONFIG.hpPerPoint);
  let mother = createGenome(1);
  let father = createGenome(2);
  let low = Infinity;
  let high = -Infinity;
  let finite = true;
  for (let generation = 0; generation < 200; generation += 1) {
    const crossed = crossGenome(mother, father, generation * 7 + 3);
    const child = mutateGenome(crossed, generation * 13 + 5);
    const hp = phenotypeOf(child).vitals.hp;
    finite = finite && Number.isFinite(hp);
    low = Math.min(low, hp);
    high = Math.max(high, hp);
    mother = father;
    father = child;
  }
  check('Jede Generation liefert endliche HP', finite);
  check('Die HP bleiben im Band der Config', low >= lowest && high <= highest, `${low}..${high} erwartet ${lowest}..${highest}`);
}

function checkReproducibility() {
  section('Genom: Reproduzierbarkeit');
  const mother = createGenome(111);
  const father = createGenome(222);
  const first = crossGenome(mother, father, 4242);
  check('Dieselben Eltern und derselbe Seed liefern dasselbe Kind', JSON.stringify(first) === JSON.stringify(crossGenome(mother, father, 4242)));
  check('Ein anderer Seed liefert ein anderes Kind', JSON.stringify(crossGenome(mother, father, 4243)) !== JSON.stringify(first));
}

function checkHashSpread() {
  section('Genom: Hash-Streuung');
  const hashes = Array.from({ length: 2000 }, (unused, index) => genomeHash(createGenome(index * 7919 + 1)));
  check('Der Hash ist eine uint32', hashes.every((hash) => Number.isInteger(hash) && hash >= 0 && hash <= 0xffffffff));
  check('Die Hashes streuen', new Set(hashes).size / hashes.length > 0.99, `${new Set(hashes).size}/${hashes.length} verschieden`);
}

function speciesCounts() {
  return FAIR_SAMPLE.reduce((map, genome) => {
    const species = phenotypeOf(genome).species;
    map[species] = (map[species] ?? 0) + 1;
    return map;
  }, {});
}

function checkFairExpression() {
  section('Genom: die Art wirft fair, nicht dominant');
  const locus = 'SPECIES';
  check('Der Art-Locus wirft fair statt dominant', GENE_LOCI[locus].mode === LOCUS_MODE.FAIR);
  check('Ein reinerbiger Art-Locus zeigt sein Allel', fairExpressed(uniform(2), locus) === 2);
  const hybrid = withPair(uniform(0), locus, [3, 0]);
  check('Ein mischerbiger zeigt eines seiner beiden Allele', [0, 3].includes(fairExpressed(hybrid, locus)));
  check('Der Wurf ist reproduzierbar', fairExpressed(hybrid, locus) === fairExpressed(hybrid, locus));
  const counts = speciesCounts();
  const shares = Object.values(SPECIES).map((species) => counts[species] ?? 0);
  check('Alle vier Arten kommen vor', shares.every((share) => share > 0), shares.join(', '));
  check('Keine Art ist doppelt so haeufig wie eine andere', Math.max(...shares) <= 2 * Math.min(...shares), shares.join(', '));
  const { species, alleles } = speciesOf(createGenome(4242));
  check('speciesOf nennt die Art und beide Anlagen', phenotypeOf(createGenome(4242)).species === species && alleles.length === 2 && alleles.every((allele) => Object.values(SPECIES).includes(allele)));
}

export function checkGenome() {
  checkDeterminism();
  checkDominance();
  checkSegregation();
  checkRecessive();
  checkPolygeny();
  checkHpBand();
  checkReproducibility();
  checkHashSpread();
  checkFairExpression();
}
