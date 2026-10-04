#!/usr/bin/env node
/** npm run purge: alle Konten weg, Datenbankdatei weg. Für Tests und für
 *  den Fall, dass du mit einem frischen Konto anfangen willst. */
import { existsSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { parse, resolve, sep } from 'node:path';
import { dataDir, databasePath } from './account-store.mjs';

const CWD = resolve(process.cwd());

/** DL_DATA_DIR kommt aus der Umgebung, also ist jeder Pfad ein Kandidat für
 *  einen Tippfehler. Geschützt ist, was den Arbeitsordner enthält — `..` ist
 *  kein Kandidat, sondern der ganze Elternordner — und was Wurzel oder Home ist. */
function forbidden(dir) {
  const target = resolve(dir);
  if (target === CWD || CWD.startsWith(target + sep)) return true;
  return [parse(target).root, resolve(homedir())].includes(target);
}

const dir = resolve(dataDir());
if (forbidden(dir)) {
  console.error(`Abbruch: ${dir} ist ein geschütztes Verzeichnis. Setze DL_DATA_DIR auf einen eigenen Ordner.`);
  process.exit(1);
}

const file = databasePath();
const had = existsSync(file);
rmSync(dir, { recursive: true, force: true });

console.log(had ? `Konten gelöscht: ${file}` : `Keine Konten vorhanden (${file})`);
console.log(`Verzeichnis frei: ${dir}`);