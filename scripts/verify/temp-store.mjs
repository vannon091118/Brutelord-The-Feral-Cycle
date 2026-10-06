/** Ein frisches Datenverzeichnis je Lauf; `:memory:` waere nutzlos, weil jede
 *  Anfrage neu oeffnet. Das `await` ist Pflicht: ohne es raeumt der `finally`
 *  zu frueh auf. Wer den Speicher nicht braucht, ignoriert das Argument. */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createLocalStore } from '../server/account-store-local.mjs';

export async function withTempStore(run) {
  const dir = mkdtempSync(`${tmpdir()}/dl-speicher-`);
  process.env.DL_DATA_DIR = dir;
  try {
    return await run(createLocalStore());
  } finally {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.DL_DATA_DIR;
  }
}
