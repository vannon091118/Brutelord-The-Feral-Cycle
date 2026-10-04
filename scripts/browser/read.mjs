/** Was der Browser zu einem Zeitpunkt zeigt: Hinweis, Essenz, Raum, Baumenü. */
import { SEL } from './config.mjs';

function numberIn(text, pattern) {
  const found = text.match(pattern);
  return found ? Number(found[1]) : null;
}

const panelOf = (page) => page.locator(SEL.hintPanel).first();

async function panelText(page) {
  const panel = panelOf(page);
  return (await panel.count()) ? await panel.innerText() : '';
}

export async function readHint(page) {
  const hint = panelOf(page).locator(SEL.hint);
  return (await hint.count()) ? (await hint.first().innerText()).trim() : '';
}

/** Das Panel eines Bauwerks: sein Text, damit Zustand und Beschriftung prüfbar sind. */
export async function readPanel(page) {
  const panel = page.locator(SEL.buildingPanel).first();
  return (await panel.count()) ? await panel.innerText() : '';
}

export async function readHud(page) {
  const text = await panelText(page);
  return {
    hint: await readHint(page),
    essence: numberIn(text, /◆\s*(\d+)/),
    raum: numberIn(text, /Raum\s*(\d+)/),
    buildMenu: await page.locator(SEL.buildMenu).count(),
  };
}