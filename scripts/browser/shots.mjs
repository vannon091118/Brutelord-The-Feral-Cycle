/** Screenshots der laufenden Anwendung. Animationen aus, sonst varyiert das Bild. */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { BROWSER_CONFIG } from './config.mjs';

const DIR = resolve(process.cwd(), 'Docs/shots');

export async function shoot(page, id) {
  mkdirSync(DIR, { recursive: true });
  const file = resolve(DIR, `${id}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 88, animations: 'disabled' });
  return file;
}

export function shotDir() {
  return DIR;
}

export const viewport = () => BROWSER_CONFIG.viewport;