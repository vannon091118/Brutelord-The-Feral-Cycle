/** Die Schreibstrategie des Spielstands: Groesse, Revision, Fassung und die
 *  Wiederherstellung. Ohne diese Gruppe blieben Obergrenze und Revisionsregel
 *  Behauptungen im Modul. Der Speicher wird nachgestellt, nicht benutzt. */
import { createInitialGameState } from '../../src/state/game-state.js';
import { SNAPSHOT_KEY, SNAPSHOT_MAX_BYTES, SNAPSHOT_REVISION_KEY, SNAPSHOT_VERSION } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE, envelopeBytes, writeDecision } from '../../src/state/snapshot-rule.js';
import { isSavedShape, readSavedState, saveSnapshot, writeIfChanged } from '../../src/state/snapshot.js';
import { check, section } from './expect.mjs';

const SEED = 'a'.repeat(16);
const BASE = Object.freeze({ bytes: 64, storedRevision: null, incomingRevision: 1, maxBytes: SNAPSHOT_MAX_BYTES });

function fakeWindow() {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    },
  };
  return store;
}

function urteil(abweichung) {
  return writeDecision({ ...BASE, ...abweichung });
}

function checkRule() {
  section('Spielstand: die Schreibregel');
  const envelope = { version: SNAPSHOT_VERSION, state: { a: 1 } };
  check('Die Groesse wird am Envelope gemessen', envelopeBytes(envelope) === JSON.stringify(envelope).length);
  check('Ein erster Stand wird geschrieben', urteil({}) === SNAPSHOT_WRITE.ok);
  check('Genau die Obergrenze geht noch durch', urteil({ bytes: SNAPSHOT_MAX_BYTES }) === SNAPSHOT_WRITE.ok);
  check('Eine Nutzlast ueber der Obergrenze wird abgewiesen',
    urteil({ bytes: SNAPSHOT_MAX_BYTES + 1 }) === SNAPSHOT_WRITE.tooLarge);
  check('Ohne Revision wird ein Stand nicht ueberschrieben',
    urteil({ storedRevision: 4, incomingRevision: undefined }) === SNAPSHOT_WRITE.stale);
  check('Die gleiche Revision ist veraltet',
    urteil({ storedRevision: 4, incomingRevision: 4 }) === SNAPSHOT_WRITE.stale);
  check('Eine kleinere Revision ist veraltet',
    urteil({ storedRevision: 4, incomingRevision: 3 }) === SNAPSHOT_WRITE.stale);
  check('Eine hoehere Revision kommt durch',
    urteil({ storedRevision: 4, incomingRevision: 5 }) === SNAPSHOT_WRITE.ok);
}

function checkRoundtrip() {
  section('Spielstand: sichern und wiederherstellen');
  const store = fakeWindow();
  const state = createInitialGameState(SEED);
  saveSnapshot(state, SEED);
  const gespeichert = JSON.parse(store.get(SNAPSHOT_KEY));
  check('Die Huuelle traegt Fassung, Saat und Revision',
    gespeichert.version === SNAPSHOT_VERSION && gespeichert.seed === SEED && gespeichert.revision === 1);
  const zurueck = readSavedState(SEED);
  check('Der Stand kommt zurueck', zurueck?.playerseed === state.playerseed && zurueck?.essence === state.essence);
  check('Die gepackte Welt wird wieder zum vollen Raster',
    zurueck?.world?.tiles?.length === state.world.tiles.length && zurueck?.world?.depth === state.world.depth);
  check('Ein unveraenderter Stand schreibt nicht noch einmal', writeIfChanged(state, SEED) === false);
  const geaendert = { ...state, essence: state.essence + 1 };
  check('Eine Aenderung schreibt genau einmal',
    writeIfChanged(geaendert, SEED) === true && store.get(SNAPSHOT_REVISION_KEY) === '2');
  check('Der zweite Schreibvorgang trug die Aenderung',
    JSON.parse(store.get(SNAPSHOT_KEY)).state.essence === geaendert.essence);
  const zuGross = { ...state, debugBlob: 'x'.repeat(SNAPSHOT_MAX_BYTES) };
  check('Eine Nutzlast ueber der Obergrenze wird nicht geschrieben', writeIfChanged(zuGross, SEED) === false);
  check('und liess den letzten guten Stand stehen',
    JSON.parse(store.get(SNAPSHOT_KEY)).state.essence === geaendert.essence);
}

function checkVersionGate() {
  section('Spielstand: die Fassung');
  const store = fakeWindow();
  const state = createInitialGameState(SEED);
  saveSnapshot(state, SEED);
  const alt = JSON.parse(store.get(SNAPSHOT_KEY));
  alt.version = SNAPSHOT_VERSION - 1;
  store.set(SNAPSHOT_KEY, JSON.stringify(alt));
  check('Ein Stand aus einer aelteren Fassung wird verworfen', readSavedState(SEED) === null);
  alt.version = SNAPSHOT_VERSION;
  store.set(SNAPSHOT_KEY, JSON.stringify(alt));
  check('Ein Stand derselben Fassung wird gelesen', readSavedState(SEED)?.playerseed === state.playerseed);
  check('Eine fremde Saat liest den Stand nicht', readSavedState('b'.repeat(16)) === null);
  store.set(SNAPSHOT_KEY, '{kein json');
  check('Kaputter Inhalt liefert null statt eines Wurfs', readSavedState(SEED) === null);
}

function keinStand(wert) {
  try {
    return isSavedShape(wert) === false;
  } catch {
    return false;
  }
}

function checkShape() {
  section('Spielstand: die Formpruefung');
  check('Was kein Objekt ist, ist kein gespeicherter Stand',
    [undefined, null, 42, 'x', true, []].every(keinStand));
  check('Ein Objekt ohne die Pflichtfelder ist keiner', keinStand({ version: SNAPSHOT_VERSION }));
}

export async function checkSnapshot() {
  const vorher = globalThis.window;
  try {
    checkRule();
    checkRoundtrip();
    checkVersionGate();
    checkShape();
  } finally {
    if (vorher === undefined) delete globalThis.window;
    else globalThis.window = vorher;
  }
}
