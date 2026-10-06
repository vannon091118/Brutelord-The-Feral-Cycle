// @doc: docs/daten/replay/run-report.md#run-report
import { RUN_LOG, logDigest, shareCode } from './run-log.js';

export function firstDivergence(expected, actual) {
  const laenge = Math.min(expected.length, actual.length);
  for (let index = 0; index < laenge; index += 1) {
    if (expected[index] !== actual[index]) return index;
  }
  return expected.length === actual.length ? -1 : laenge;
}

function stepLine({ log, expected, actual, index }) {
  if (index === -1) return `Alle ${expected.length} Zuege stimmen ueberein.`;
  const zug = log.inputs[index];
  const feld = (kette) => kette[index] ?? '—';
  return `Erste Abweichung: Zug ${index + 1} von ${log.inputs.length} (${zug ? zug.type : 'kein Zug'}) — erwartet ${feld(expected)}, gelesen ${feld(actual)}`;
}

export function bugReport({ log, expected = [], actual = [], note = '' }) {
  const ab = firstDivergence(expected, actual);
  const kopf = [
    `Brutelord ${RUN_LOG.prefix} — reproduzierbarer Bericht`,
    `Seed: ${log.seed}`,
    `Eingaben: ${log.inputs.length} (Digest ${logDigest(log)})`,
    shareCode(log) ? `Share-Code: ${shareCode(log)}` : `Share-Code: keiner — der Lauf liegt ueber ${RUN_LOG.shareInputs} Eingaben.`,
    stepLine({ log, expected, actual, index: ab }),
  ];
  if (note) kopf.push(`Hinweis: ${note}`);
  kopf.push(`Nachspielen: npm run check -- replay (Seed ${log.seed}, ${log.inputs.length} Eingaben)`);
  return kopf.join('\n');
}
