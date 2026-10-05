/** Der Zustandszugang des Laufs: lesen ist billig, weil über die Leitung nur
 *  das wandert, was ein Urteil braucht — das Raster bleibt im Fenster. */
export async function readState(page) {
  return page.evaluate(() => {
    const state = window.__dl?.state;
    if (!state) return null;
    const { tiles, ...world } = state.world;
    return { ...state, world };
  });
}

export async function readFullState(page) {
  return page.evaluate(() => window.__dl?.state ?? null);
}

/** Die Phase jeder Kachel, ohne die Kachel selbst: 4096 × zwei Felder statt
 *  4096 × 185 Byte über die Leitung, und ein Welt-Urteil sieht trotzdem alles. */
export async function readTilePhases(page) {
  return page.evaluate(() =>
    (window.__dl?.state?.world.tiles ?? []).map((tile) => ({ kind: tile?.kind, phase: tile?.rooting?.phase })),
  );
}

/** Abwartin: wartet, bis eine Bedingung über den echten Zustand wahr wird. */
export async function waitState(page, { label, until, timeoutMs = 200000, log }) {
  const started = Date.now();
  let last = '';
  for (;;) {
    const state = await readState(page);
    const result = until(state ?? {});
    if (result) return state;
    const key = String(result);
    if (key !== last) {
      last = key;
      log?.(`  ⏳ ${label}: ${key}`);
    }
    if (Date.now() - started > timeoutMs) throw new Error(`Zeitüberschreitung: ${label} (zustand ${key})`);
    await page.waitForTimeout(300);
  }
}

export function stateSummary(state) {
  return {
    essence: state.essence,
    onboarding: state.onboarding?.state,
    dunglings: state.dunglings?.length,
    buildings: state.buildings?.length,
    usable: state.usableTileCount,
    labStones: state.lab?.stones?.length,
  };
}