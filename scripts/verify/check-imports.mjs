/** Die Importrichtungen als technische Grenze. Der echte Baum wird geprueft,
 *  und danach laeuft die Regel gegen erfundene Kanten, die sie fangen MUSS —
 *  eine Pruefung, die nie rot wird, prueft nichts. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ALLOWED_TARGETS, importViolations } from '../lib/import-rules.mjs';
import { check, section } from './expect.mjs';

const FREMDFALL = Object.freeze([
  { path: 'src/domain/fremd.js', code: "import { allTiles } from '../world/grid.js';", richtung: 'domain -> world' },
  { path: 'src/domain/fremd.js', code: "import { GameHud } from '../ui/GameHud.jsx';", richtung: 'domain -> ui' },
  { path: 'src/domain/raid/fremd.js', code: "import { useState } from 'react';", richtung: 'domain -> React' },
  { path: 'src/state/fremd.js', code: "import { GameHud } from '../ui/GameHud.jsx';", richtung: 'state -> ui' },
  { path: 'src/world/fremd.js', code: "import { GameHud } from '../ui/GameHud.jsx';", richtung: 'world -> ui' },
  { path: 'src/domain/raid/fremd.js', code: "import { deep } from '../../../tools/tief.js';", richtung: 'domain -> ausserhalb src' },
]);

const SAUBERFALL = Object.freeze([
  { path: 'src/domain/raid/eigen.js', code: "import { tileAt } from '../world/grid.js';" },
  { path: 'src/state/eigen.js', code: "import { tileAt } from '../domain/world/grid.js';" },
  { path: 'src/state/eigen.js', code: "import { useEffect } from 'react';" },
  { path: 'src/world/eigen.js', code: "import { tileAt } from '../domain/world/grid.js';" },
  { path: 'src/ui/eigen.jsx', code: "import { useWorld } from '../world/use-world.js';" },
]);

function collect(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) collect(path, found);
    else if (/\.(js|jsx)$/.test(path)) found.push(path);
  }
  return found;
}

function treeEntries() {
  return collect('src').map((path) => ({ path, code: readFileSync(path, 'utf8') }));
}

function checkTable() {
  section('Architektur: die Richtungstabelle');
  check('Jede Schicht hat eine Ziel-Liste', ['domain', 'state', 'world', 'ui', 'app', 'root', 'styles']
    .every((layer) => Array.isArray(ALLOWED_TARGETS[layer])));
  check('Die Domaene kennt nur sich selbst', ALLOWED_TARGETS.domain.join(',') === 'domain');
  check('Der Zustand darf die Ansicht nicht importieren', !ALLOWED_TARGETS.state.includes('ui'));
  check('Die Welt darf die Ansicht nicht importieren', !ALLOWED_TARGETS.world.includes('ui'));
  check('Der Zustand darf die Domaene lesen', ALLOWED_TARGETS.state.includes('domain'));
}

function checkForbidden() {
  section('Architektur: die verbotenen Richtungen fallen');
  for (const fall of FREMDFALL) {
    const treffer = importViolations([{ path: fall.path, code: fall.code }]);
    check(`Abgewiesen: ${fall.richtung}`, treffer.length === 1 && treffer[0].includes(fall.path), treffer[0] ?? 'nichts gefunden');
  }
  const sauber = importViolations(SAUBERFALL);
  check('Erlaubte Kanten bleiben erlaubt', sauber.length === 0, sauber.slice(0, 2).join(', '));
}

function checkTree() {
  section('Architektur: der echte Baum');
  const treffer = importViolations(treeEntries());
  check('Kein Modul unter src/ importiert gegen die Tabelle', treffer.length === 0, treffer.slice(0, 3).join(', '));
}

export async function checkImports() {
  checkTable();
  checkForbidden();
  checkTree();
}
