/** Der Kontur-Digest: je Genom die Ringe aller vier Atemphasen als vier
 *  Hashes, sortiert nach Genom-Hash. Die Geometrie aendert keinen Spielstand,
 *  nur ein Bild — deshalb steht sie in einem eigenen Golden-Abschnitt, und
 *  ein Drift nennt Genom und Phase statt eine anonyme Zug-Nummer. */
import { phenotypeOf } from '../../src/domain/brutelord/phenotype.js';
import { organicFrame } from '../../src/domain/brutelord/organic-cache.js';

const PHASES = 4;
const FNV = 2166136261;

function textDigest(value) {
  let h = FNV;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

function hex(value) {
  return value.toString(16).padStart(8, '0');
}

export function phaseDigests(genome) {
  return Array.from({ length: PHASES }, (unused, phase) => hex(textDigest(JSON.stringify(organicFrame(genome, phase).rings))));
}

export function contourEntries(genomes) {
  return Object.fromEntries(
    genomes
      .map((genome) => [phenotypeOf(genome).hash.toString(36), phaseDigests(genome)])
      .sort((left, right) => (left[0] < right[0] ? -1 : 1)),
  );
}
