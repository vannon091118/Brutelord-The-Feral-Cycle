#!/usr/bin/env node
/** Der Renderbeleg der Steinbereiche: vier Kacheln und vier Plaetze, einer je Seltenheit.
 *  Der Stand kommt aus dem eingefrorenen Zustand labor-offen; DL_BROWSER_URL zeigt auf den
 *  Server, der die zu belegende Fassung ausliefert (Vorher: der Arbeitsbaum der Basisrevision). */
import { chromium } from 'playwright';
import { RARITY_ORDER, STONE_DEFS } from '../../src/domain/brutelord/stone-config.js';
import { SNAPSHOT_KEY } from '../../src/state/snapshot-config.js';
import { SESSION_KEY } from '../../src/ui/account/session.js';
import { readFixture } from '../../tools/tests/lib/fixture.mjs';
import { BROWSER_CONFIG, baseUrl, pinnedSession } from './config.mjs';
import { shootElement } from './shots.mjs';

const LAB = 'section[aria-label="Labor des Brutlords"]';
const CHIP = 'button[aria-label^="Essenz-Stein:"]';
const SLOTS = ['Kopf', 'Rumpf', 'Arme', 'Beine'];
const slot = (name) => `[aria-label="Slot ${name}"]`;

function option(name, fallback) {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : fallback;
}

function proofEnvelope() {
  const fixture = readFixture('labor-offen');
  const proto = fixture.state.lab.stones[0];
  const stones = RARITY_ORDER.map((rarity, index) => ({
    ...proto,
    seed: proto.seed + index * 7919,
    rarity,
    slot: null,
    discovered: false,
    visual: { ...proto.visual, slot: null, variant: 1 + index },
  }));
  const state = { ...fixture.state, essence: 40, lab: { ...fixture.state.lab, stones, open: true } };
  return { ...fixture, state };
}

async function openProof(page, envelope) {
  const session = { ...pinnedSession(), playerseed: envelope.seed };
  await page.addInitScript(
    ([sessionKey, snapshotKey, clean, snapshot]) => {
      window.localStorage.setItem(sessionKey, JSON.stringify(clean));
      window.localStorage.setItem(snapshotKey, JSON.stringify(snapshot));
    },
    [SESSION_KEY, SNAPSHOT_KEY, session, envelope],
  );
  await page.goto(baseUrl(), { waitUntil: 'load' });
  await page.waitForSelector(`${LAB} ${CHIP}`, { timeout: BROWSER_CONFIG.bootTimeoutMs });
}

async function placeAll(page) {
  for (const name of SLOTS) {
    const free = await page.locator(CHIP).count();
    await page.locator(CHIP).first().click();
    await page.locator(slot(name)).click();
    await page.waitForFunction(
      ([selector, count]) => document.querySelectorAll(selector).length === count - 1,
      [CHIP, free],
    );
  }
}

async function placedLabels(page) {
  const texts = await page.locator(SLOTS.map(slot).join(', ')).allInnerTexts();
  return texts.map((text) => text.trim()).sort();
}

export async function renderProof({ stand }) {
  const envelope = proofEnvelope();
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: BROWSER_CONFIG.viewport });
    const page = await context.newPage();
    await openProof(page, envelope);
    const kacheln = await shootElement(page, `labor-${stand}-kacheln`, LAB);
    await placeAll(page);
    const erwartet = RARITY_ORDER.map((rarity) => STONE_DEFS[rarity].label).sort();
    const gelesen = await placedLabels(page);
    if (JSON.stringify(gelesen) !== JSON.stringify(erwartet)) {
      throw new Error(`Die Plaetze tragen ${gelesen.join(', ')} statt ${erwartet.join(', ')}`);
    }
    const plaetze = await shootElement(page, `labor-${stand}-plaetze`, LAB);
    return [kacheln, plaetze];
  } finally {
    await browser.close();
  }
}

const STAND = option('stand', 'nachher');
if (process.argv[1]?.endsWith('render-proof.mjs')) {
  if (!['vorher', 'nachher'].includes(STAND)) {
    console.error(`Unbekannter Stand: ${STAND} — erlaubt sind vorher und nachher.`);
    process.exitCode = 1;
  } else {
    const files = await renderProof({ stand: STAND });
    files.forEach((file) => console.log(`  ${file}`));
  }
}
