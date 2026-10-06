/** Die lebenden Anleitungen nennen Befehle und Skriptpfade. Ein umbenanntes oder
 *  geloeschtes Skript darf dort nicht stehen bleiben: die Doku ist hier Vertrag,
 *  und eine zweite Wahrheit laeuft still auseinander. Historische Dokumente
 *  (CHANGELOG, PITFALLS) erzaehlen Vergangenheit und werden nicht geprueft. */
import { existsSync, readFileSync } from 'node:fs';
import { check, section } from './expect.mjs';

const QUELLEN = [
  'AGENTS.md',
  'CLAUDE.md',
  'COMMIT_POLICY.md',
  'README.md',
  'Docs/WORKFLOW.md',
  'Docs/GOVERNANCE.md',
  'Docs/ARCHITEKTUR.md',
];
const BEFEHL_RE = /npm run ([a-z][\w:-]*)/g;
const PFAD_RE = /`((?:scripts|tools)\/[\w./-]+\.(?:mjs|js|json|sql|yml))`/g;

function genannt(pattern) {
  const treffer = new Set();
  for (const datei of QUELLEN.filter(existsSync)) {
    for (const match of readFileSync(datei, 'utf8').matchAll(pattern)) treffer.add(match[1]);
  }
  return [...treffer];
}

export function checkCommands() {
  section('Die Doku nennt nur Befehle und Skripte, die es gibt');
  const vorhanden = Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).scripts ?? {});
  const fehlendeBefehle = genannt(BEFEHL_RE).filter((name) => !vorhanden.includes(name));
  const fehlendePfade = genannt(PFAD_RE).filter((pfad) => !existsSync(pfad));
  check('Jeder genannte npm-Befehl existiert', fehlendeBefehle.length === 0, fehlendeBefehle.join(', '));
  check('Jeder genannte Skriptpfad existiert', fehlendePfade.length === 0, fehlendePfade.join(', '));
}
