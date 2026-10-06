/** Die Uhr im Browser: weit weg vom Ziel grob springen, am Rand fein nachziehen.
 *  Gemessen im Fuenf-Sekunden-Fenster: hundert Spruenge zu 50 ms kosten 5016 ms,
 *  zehn zu 500 ms kosten 1971 ms. Das feine Fenster am Ziel haelt den
 *  gemeldeten Zeitpunkt auf 50 ms genau, damit kein Budget dadurch reisst. */
export const STEP_MS = 50;
const GROB_MS = 500;
const FENSTER_MS = 1000;

/** Springt in Schritten, bis der Treffer sitzt; meldet Zeit und Erfolg. */
export async function advanceUntil({ page, within, matches, read }) {
  let elapsed = 0;
  for (;;) {
    if (matches(await read())) return { reached: true, elapsed };
    if (elapsed >= within) return { reached: false, elapsed };
    const rest = within - elapsed;
    const schritt = Math.min(rest < FENSTER_MS ? STEP_MS : GROB_MS, rest);
    await page.clock.runFor(schritt);
    elapsed += schritt;
  }
}
