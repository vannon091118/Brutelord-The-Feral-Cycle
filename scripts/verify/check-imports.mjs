/** Die Importrichtungen als technische Grenze. Der echte Baum wird geprueft,
 *  und danach laeuft die Regel gegen erfundene Kanten, die sie fangen MUSS —
 *  eine Pruefung, die nie rot wird, prueft nichts. Dieselbe Funktion liest das
 *  Gate (`npm run gate`, Block Importrichtungen): eine Regel, ein Ort. */
import { ALLOWED_TARGETS, importViolations, treeEntries, treeViolations } from '../lib/import-rules.mjs';
import { check, section } from './expect.mjs';

const FREMDFALL = Object.freeze([
  { path: 'src/domain/fremd.js', code: "import { allTiles } from '../world/grid.js';", richtung: 'domain -> world' },
  { path: 'src/domain/fremd.js', code: "import { GameHud } from '../ui/GameHud.jsx';", richtung: 'domain -> ui' },
  { path: 'src/domain/raid/fremd.js', code: "import { useState } from 'react';", richtung: 'domain -> React' },
  { path: 'src/state/fremd.js', code: "import { GameHud } from '../ui/GameHud.jsx';", richtung: 'state -> ui' },
  { path: 'src/world/fremd.js', code: "import { GameHud } from '../ui/GameHud.jsx';", richtung: 'world -> ui' },
  { path: 'src/domain/raid/fremd.js', code: "import { deep } from '../../../tools/tief.js';", richtung: 'domain -> ausserhalb src' },
  { path: 'src/domain/fremd.js', code: "const modul = await import('../world/grid.js');", richtung: 'domain -> world (dynamisch)' },
  { path: 'src/neue-schicht/fremd.js', code: "import { useState } from 'react';", richtung: 'unbekannte Schicht unter src' },
]);

const SAUBERFALL = Object.freeze([
  { path: 'src/domain/raid/eigen.js', code: "import { tileAt } from '../world/grid.js';" },
  { path: 'src/state/eigen.js', code: "import { tileAt } from '../domain/world/grid.js';" },
  { path: 'src/state/eigen.js', code: "import { useEffect } from 'react';" },
  { path: 'src/state/eigen.js', code: "const modul = await import('../domain/world/grid.js');" },
  { path: 'src/world/eigen.js', code: "import { tileAt } from '../domain/world/grid.js';" },
  { path: 'src/ui/eigen.jsx', code: "import { useWorld } from '../world/use-world.js';" },
]);

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
  const treffer = treeViolations();
  check('Kein Modul unter src/ importiert gegen die Tabelle', treffer.length === 0, treffer.slice(0, 3).join(', '));
  check('Der Baum der Regel ist der Baum des Gates', treeEntries().length > 100, `${treeEntries().length} Dateien`);
}

export async function checkImports() {
  checkTable();
  checkForbidden();
  checkTree();
}
