/** Der Vertrag, den jede Datenbank erfuellt. Wer eine dritte schreibt, programmiert
 *  gegen diese vier Methoden. Warum, und warum das Replay NICHT hier steht: B3, B5,
 *  B6 in Docs/BACKEND-PLAN.md. */
import { STORAGE_METHODS } from './storage-contract.mjs';

export { STORAGE_METHODS };

/** Leere Liste heisst: erfuellt den Vertrag. Alles andere nennt den Bruch. */
export function storageViolations(store) {
  const maengel = [];
  if (!store || typeof store !== 'object') return ['Der Speicher ist kein Objekt.'];
  for (const name of STORAGE_METHODS) {
    if (typeof store[name] !== 'function') {
      maengel.push(`${name} fehlt.`);
    } else if (store[name].constructor.name !== 'AsyncFunction') {
      maengel.push(`${name} ist nicht als async deklariert.`);
    }
  }
  return maengel;
}

/** Das Pruefprogramm, das ein Speicher beim Bauen einmal durchlaeuft. */
export async function storageProbe(store) {
  const maengel = storageViolations(store);
  if (maengel.length) return maengel;
  if ((await store.getAccount('__probe__')) !== null) {
    maengel.push('getAccount liefert fuer einen unbekannten Namen etwas anderes als null.');
  }
  return maengel;
}
