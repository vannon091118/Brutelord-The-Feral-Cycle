/** Screenshots der laufenden Anwendung. Animationen aus, sonst varyiert das Bild. */
import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BROWSER_CONFIG } from './config.mjs';

const DIR = resolve(process.cwd(), 'Docs/shots');

export async function shoot(page, id) {
  const file = resolve(DIR, `${id}.jpg`);
  // Die Bilder sind versionierte Doku, aber jede Abnahme faehrt neu auf. Ohne
  // VERIFY_SHOTS=1 wird nur geschrieben, was fehlt, damit der Baum nach der
  // Abnahme sauber bleibt; zurueckgegeben wird immer der Pfad (GOVERNANCE).
  if (process.env.VERIFY_SHOTS !== '1' && existsSync(file)) return file;
  mkdirSync(DIR, { recursive: true });
  await page.screenshot({ path: file, type: 'jpeg', quality: 88, animations: 'disabled' });
  return file;
}

export function shotDir() {
  return DIR;
}

export const viewport = () => BROWSER_CONFIG.viewport;