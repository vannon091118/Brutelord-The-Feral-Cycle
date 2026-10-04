/** Der Spielerseed kommt aus dem Konto als Hex, die Domäne rechnet mit einer Zahl.
 *  Diese Funktion ist die einzige Tür: Zahl bleibt Zahl, Hex wird gelesen. Sonst
 *  entscheidet der Zufall, ob ein Seed aus Buchstaben oder nur Ziffern besteht —
 *  'a1b2c3d4' plus Zahl ist NaN, '12345678' plus Zahl ist eine Riesenzahl. */
import { WORLD_SEED } from './world-config.js';

export function worldSeed(playerseed) {
  if (typeof playerseed === 'number') return playerseed >>> 0;
  if (typeof playerseed !== 'string') return WORLD_SEED.anonymous;
  return Number.parseInt(playerseed.slice(0, WORLD_SEED.hexLength), 16) >>> 0;
}
