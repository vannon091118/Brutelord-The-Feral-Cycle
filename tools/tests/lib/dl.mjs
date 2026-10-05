/** Die Griffe in der echten Seite: Auswahl, Wartung auf Zustand, Lektüre des Spielstands. */
import { readState, waitState } from './probe.mjs';

export const SEL = Object.freeze({
  field: 'svg[aria-label="Dungeon Lord — Spielfeld"]',
  hive: '[aria-label="Hive anklicken"]',
  earth: (x, y) => `[aria-label="Erdblock bei ${x}, ${y} abbauen"]`,
  mineItem: '[role="menu"][aria-label="Erdblock"] [role="menuitem"]',
  buildMenu: 'section[aria-label="Baumenü"]',
  buildOption: (label) => `[aria-label="Baumenü"] button:has-text("${label}")`,
  spot: (label) => `[role="button"][aria-label^="Bauplatz für ${label}"]`,
  panel: '[aria-label^="Bauwerk:"]',
  lab: 'section[aria-label="Labor des Brutlords"]',
  stoneChip: 'button[aria-label^="Essenz-Stein:"]',
  slot: (name) => `[aria-label="Slot ${name}"]`,
  hintPanel: '.dl-panel:has-text("Raum")',
  submit: 'button[type="submit"]',
  nameField: 'input[autocomplete="username"]',
  passField: 'input[type="password"]',
});

export const BUILDING_LABEL = Object.freeze({
  swarmHost: 'Schwarmhort',
  extractor: 'Essenz Extractor',
  bruteLord: 'Brutlord',
});

export async function mineableEarth(page) {
  return page.evaluate(() => {
    const state = window.__dl?.state;
    if (!state) return [];
    const usable = (x, y) => {
      const tile = state.world.tiles[y * state.world.width + x];
      return tile && tile.usability === 'USABLE';
    };
    const found = [];
    for (const tile of state.world.tiles) {
      if (!tile || tile.kind !== 'EARTH' || tile.visibility !== 'VISIBLE') continue;
      const neighbours = [usable(tile.x + 1, tile.y), usable(tile.x - 1, tile.y), usable(tile.x, tile.y + 1), usable(tile.x, tile.y - 1)].filter(Boolean).length;
      if (neighbours > 0) found.push({ id: `${tile.x},${tile.y}`, neighbours });
    }
    return found.sort((a, b) => b.neighbours - a.neighbours).map((entry) => entry.id);
  });
}

export async function mineOne(page, { label, log }) {
  const before = (await readState(page))?.usableTileCount ?? 0;
  const ids = await mineableEarth(page);
  if (ids.length === 0) throw new Error('Kein abbau­barer Erdblock im Zuststand');
  const [x, y] = ids[0].split(',').map(Number);
  await page.locator(SEL.earth(x, y)).click();
  await page.locator(SEL.mineItem).click();
  await waitState(page, {
    label: `${label}: Raum wächst über ${before}`,
    until: (state) => state.usableTileCount > before,
    timeoutMs: 25000,
    log,
  });
  log?.(`  ✔ ${label}: Feld ${x},${y} abgebaut, Raum ${before} → ${(await readState(page))?.usableTileCount}`);
}

export async function panelText(page) {
  const panel = page.locator(SEL.panel).first();
  return (await panel.count()) ? panel.innerText() : '';
}

/** Ein Element auf ein anderes ziehen. Bekommen werden **Selektoren**: `dragTo`
 *  benutzt die Maus und loest kein HTML5-Drop aus, wirft aber keinen Fehler —
 *  darum kommen die echten `DragEvent`s samt DataTransfer immer dazu. */
export async function dropOn(page, fromSel, toSel) {
  await page.locator(fromSel).dragTo(page.locator(toSel)).catch(() => null);
  return page.evaluate(
    ([sourceSel, targetSel]) => {
      const source = document.querySelector(sourceSel);
      const target = document.querySelector(targetSel);
      if (!source || !target) return false;
      const data = new DataTransfer();
      const carry = (node, type) =>
        node.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
      carry(source, 'dragstart');
      carry(target, 'dragover');
      carry(target, 'drop');
      carry(source, 'dragend');
      return true;
    },
    [fromSel, toSel],
  );
}