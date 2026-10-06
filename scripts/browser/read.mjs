/** Was der Browser zu einem Zeitpunkt zeigt: Hinweis, Essenz, Raum, Baumenü.
 *  Eine Messung ist **ein** Evaluate im Seitenkontext; über Locator-Runden
 *  kostet dieselbe Auskunft gemessen das Sechsfache (131 ms gegen 17 ms). */
import { SEL } from './config.mjs';

/** Ein Evaluate liefert das ganze Bild — auch wenn nur ein Feld gebraucht wird. */
export function readHud(page) {
  return page.evaluate((sel) => {
    const panels = [...document.querySelectorAll('.dl-panel')];
    const hintPanel = panels.find((node) => node.innerText.includes('Raum'));
    const text = hintPanel ? hintPanel.innerText : '';
    const numberIn = (pattern) => {
      const found = new RegExp(pattern).exec(text);
      return found ? Number(found[1]) : null;
    };
    return {
      hint: hintPanel?.querySelector(sel.hint)?.innerText.trim() ?? '',
      panel: document.querySelector(sel.buildingPanel)?.innerText ?? '',
      essence: numberIn('◆\\s*(\\d+)'),
      raum: numberIn('Raum\\s*(\\d+)'),
      buildMenu: document.querySelectorAll(sel.buildMenu).length,
    };
  }, SEL);
}

export async function readPanel(page) {
  return (await readHud(page)).panel;
}

export async function readHint(page) {
  return (await readHud(page)).hint;
}
