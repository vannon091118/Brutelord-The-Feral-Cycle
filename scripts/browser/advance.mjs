/** Die Uhr im Browser: Zeit springt in kleinen Schritten, die Seite atmet mit. */
import { SEL } from './config.mjs';

export const STEP_MS = 50;

export async function step(page, ms) {
  await page.clock.runFor(ms);
  await page.locator(SEL.field).first().waitFor({ state: 'attached' });
}

/** Springt in Schritten, bis der Hinweis passt; meldet Zeit und Erfolg. */
export async function advanceUntil({ page, within, matches, read }) {
  let elapsed = 0;
  while (elapsed <= within) {
    if (matches(await read())) return { reached: true, elapsed };
    await page.clock.runFor(STEP_MS);
    elapsed += STEP_MS;
  }
  return { reached: matches(await read()), elapsed };
}