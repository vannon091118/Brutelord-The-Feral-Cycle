#!/usr/bin/env node
/** npm run purge: alle Konten weg, Datenbankdatei weg. Für Tests und für
 *  den Fall, dass du mit einem frischen Konto anfangen willst. */
import { existsSync, rmSync } from 'node:fs';
import { dataDir, databasePath } from './account-store.mjs';

const file = databasePath();
const had = existsSync(file);
if (had) rmSync(file);
rmSync(dataDir(), { recursive: true, force: true });

console.log(had ? `Konten gelöscht: ${file}` : `Keine Konten vorhanden (${file})`);
console.log(`Verzeichnis frei: ${dataDir()}`);
