/** Der Replay: derselbe Lauf aus Seed und Eingaben. Aufgezeichnet wird ein
 *  echter Durchlauf des Slices, nachgespielt wird er ueber denselben Reducer —
 *  Zug fuer Zug gegen den Zustands-Hash, den der Durchlauf selbst geliefert hat. */
import { RUN_LOG, createRunLog, logDigest, parseShareCode, recordInput, shareCode } from '../../src/domain/replay/run-log.js';
import { bugReport, firstDivergence } from '../../src/domain/replay/run-report.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { buildRun } from './build-run.mjs';
import { stateDigest } from './state-digest.mjs';
import { check, section } from './expect.mjs';

const SEED = 'a1b2c3d4';

function aufnehmen(seed = SEED) {
  let log = createRunLog(seed);
  const digests = [];
  const record = (state, now, action) => {
    log = recordInput(log, action);
    digests.push(stateDigest(state));
  };
  const run = buildRun({ seed, onDispatch: record });
  return { log, digests, state: run.clock.state };
}

function nachspielen(inputs, seed) {
  let state = createInitialGameState(seed);
  return inputs.map((input) => {
    state = gameReducer(state, input);
    return stateDigest(state);
  });
}

function ausschnitt(log, count) {
  return { ...log, inputs: log.inputs.slice(0, count) };
}

function mitErsetztemZug(log, index, input) {
  return { ...log, inputs: log.inputs.map((eigener, stelle) => (stelle === index ? input : eigener)) };
}

function checkAufnahme(aufnahme) {
  section('Replay: der Lauf wird aufgezeichnet');
  const { log, digests } = aufnahme;
  check('Der Lauf traegt seinen Seed', log.seed === SEED && log.version === RUN_LOG.version, log.seed);
  check('Er ist lang genug fuer ein echtes Nachspielen', log.inputs.length > 500 && log.inputs.length <= RUN_LOG.maxInputs, `${log.inputs.length} Eingaben`);
  check('Jeder Zug traegt einen Typ', log.inputs.every((input) => typeof input.type === 'string'));
  check('Es fielen genauso viele Zustaende wie Zuege', digests.length === log.inputs.length);
  check('Zweimal aufnehmen ist zweimal derselbe Lauf', logDigest(aufnehmen().log) === logDigest(log), logDigest(log));
}

function checkWiedergabe(aufnahme) {
  section('Replay: Seed und Eingaben genuegen');
  const { log, digests, state } = aufnahme;
  const kette = nachspielen(log.inputs, log.seed);
  const ab = firstDivergence(digests, kette);
  check('Jeder Zug trifft denselben Zustand', ab === -1, ab === -1 ? `${kette.length} Zuege` : `Abweichung im Zug ${ab + 1} (${log.inputs[ab].type})`);
  check('Der Endzustand ist derselbe', kette.at(-1) === stateDigest(state));
  check('Ein fremder Seed ist ein anderer Lauf', firstDivergence(digests, nachspielen(log.inputs, 'ffffffff')) !== -1);
  const erste = log.inputs[0];
  const zweite = log.inputs.find((input) => input.type !== erste.type);
  const ersetzt = nachspielen(mitErsetztemZug(log, 0, zweite).inputs, log.seed);
  check('Ein veraenderter erster Zug weicht im ersten Zug ab', firstDivergence(digests, ersetzt) === 0, `erwartet ${erste.type}, ersetzt durch ${zweite.type}`);
  const gekuerzt = nachspielen(log.inputs.slice(0, -1), log.seed);
  check('Ein gekuerzter Lauf weicht an seinem Ende ab', firstDivergence(digests, gekuerzt) === gekuerzt.length);
  const mitte = Math.floor(log.inputs.length / 2);
  const umgestellt = nachspielen(mitErsetztemZug(log, mitte, zweite).inputs, log.seed);
  check('Ein veraenderter Zug in der Mitte faellt auf', firstDivergence(digests, umgestellt) >= 0);
}

function checkShare(aufnahme) {
  section('Replay: der Share-Code traegt denselben Lauf');
  const kurz = ausschnitt(aufnahme.log, RUN_LOG.shareInputs);
  const code = shareCode(kurz);
  check('Ein Lauf bis zur Share-Grenze hat einen Code', typeof code === 'string' && code.startsWith(`${RUN_LOG.prefix}-`), String(code).slice(0, 24));
  const zurueck = parseShareCode(code);
  check('Der Code traegt Seed und alle Eingaben', zurueck?.seed === SEED && zurueck.inputs.length === RUN_LOG.shareInputs, `${zurueck?.inputs.length} Eingaben`);
  check('Der Code spielt dieselben Zustaende nach', firstDivergence(aufnahme.digests.slice(0, RUN_LOG.shareInputs), nachspielen(zurueck.inputs, zurueck.seed)) === -1);
  check('Ein fremder Praefix wird abgewiesen', parseShareCode(code.replace(`${RUN_LOG.prefix}-`, 'BFC9-')) === null);
  check('Eine zu grosse Zahl wird abgewiesen', parseShareCode(`${RUN_LOG.prefix}-${SEED}-9999-${logDigest(kurz)}-`) === null);
  check('Ein veraenderter Code wird abgewiesen', parseShareCode(code.replace('~', '~x')) === null);
  const leer = parseShareCode(shareCode(createRunLog(SEED)));
  check('Ein leerer Lauf ist ein gueltiger Code', Array.isArray(leer?.inputs) && leer.inputs.length === 0);
  check('Ein Lauf ueber der Share-Grenze bekommt keinen Code', shareCode(aufnahme.log) === null, `${aufnahme.log.inputs.length} Eingaben`);
}

function checkReport(aufnahme) {
  section('Replay: der Bericht nennt die Stelle');
  const kurz = ausschnitt(aufnahme.log, 64);
  const soll = aufnahme.digests.slice(0, 64);
  const ist = nachspielen(mitErsetztemZug(kurz, 0, kurz.inputs[1]).inputs, kurz.seed);
  const ab = firstDivergence(soll, ist);
  const text = bugReport({ log: kurz, expected: soll, actual: ist, note: 'Waechter blieb stehen' });
  check('Er nennt Seed und Eingabezahl', text.includes(`Seed: ${SEED}`) && text.includes(`${kurz.inputs.length} (Digest`));
  check('Er nennt den Share-Code', text.includes(`${RUN_LOG.prefix}-${SEED}-`));
  check('Er nennt Zug und Aktion der Abweichung', text.includes(`Zug ${ab + 1} von ${kurz.inputs.length}`) && text.includes(kurz.inputs[ab].type), `Zug ${ab + 1}`);
  check('Er nennt beide Hashes', text.includes(soll[ab]) && text.includes(ist[ab]));
  check('Er traegt den Hinweis des Spielers', text.includes('Hinweis: Waechter blieb stehen'));
  check('Er sagt, dass ein zu langer Lauf keinen Code hat', bugReport({ log: aufnahme.log }).includes(`ueber ${RUN_LOG.shareInputs} Eingaben`));
  check('Eine uebereinstimmende Kette meldet keine Abweichung', bugReport({ log: kurz, expected: soll, actual: soll }).includes('stimmen ueberein'));
  check('Gleiche Ketten haben keine Abweichung', firstDivergence(['a', 'b'], ['a', 'b']) === -1);
  check('Eine kuerzere Kette weicht an ihrem Ende ab', firstDivergence(['a', 'b', 'c'], ['a', 'b']) === 2);
  check('Zwei leere Ketten sind stimmig', firstDivergence([], []) === -1);
}

export function checkReplay() {
  const aufnahme = aufnehmen();
  checkAufnahme(aufnahme);
  checkWiedergabe(aufnahme);
  checkShare(aufnahme);
  checkReport(aufnahme);
}
