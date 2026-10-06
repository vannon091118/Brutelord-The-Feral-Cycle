/** Der Schwarm des Kaders: gespeicherte Dunglinge mit echten Steinen, gebaut mit
 *  den Wurf-Funktionen der Domaene. Die Seeds sind ausgewaehlt — jeder Stein
 *  traegt Grit 20, atk 20 und Grabfaehigkeit —, damit ein ehrlicher Kader die
 *  gemessene Strecke auch wirklich schafft. */
import { createStone, statsOf } from '../../src/domain/brutelord/stone-roll.js';

export { statsOf };

export const KADER_SEEDS = Object.freeze([
  66, 107, 208, 249, 260, 301, 320, 361, 402, 443, 514, 555,
  656, 697, 852, 893, 964, 1005, 1028, 1069, 1104, 1145, 1216, 1257,
]);

export function steine(anzahl, versatz = 0) {
  return Array.from({ length: anzahl }, (unused, index) => createStone({
    seed: KADER_SEEDS[(index + versatz) % KADER_SEEDS.length],
    pityMisses: 30,
  }));
}

export function dungling(id, anzahl = 4, versatz = 0) {
  return { id, stones: steine(anzahl, versatz) };
}

export function schwarm(anzahl = 6) {
  return Array.from({ length: anzahl }, (unused, index) => dungling(`dungling-${index + 1}`, 4, index * 4));
}
