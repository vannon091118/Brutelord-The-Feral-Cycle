/** Ein Schritt der Erwartungsliste: fahren, messen, einhalten oder melden. */
import { HINTS } from '../../src/ui/hint-texts.js';
import { check } from '../verify/expect.mjs';
import { advanceUntil } from './advance.mjs';
import { readHud, readPanel } from './read.mjs';
import { SEL } from './config.mjs';
import { shoot } from './shots.mjs';

const HUD_KEYS = ['essence', 'raum', 'buildMenu'];

const hintWalk = (page, wanted, within) => ({
  page,
  within,
  matches: (hud) => hud.hint === wanted,
  read: () => readHud(page),
});

const panelWalk = (page, wanted, within) => ({
  page,
  within,
  matches: (text) => text.includes(wanted),
  read: () => readPanel(page),
});

async function checkHud({ beat, spec, hud, page }) {
  for (const key of HUD_KEYS) {
    if (spec[key] === undefined) continue;
    check(`${beat.id} — ${key} ist ${spec[key]}`, hud[key] === spec[key], `gelesen: ${hud[key]}`);
  }
  if (spec.spots !== undefined) {
    const spots = await page.locator(SEL.spot).count();
    check(`${beat.id} — Bauplätze stehen ${spec.spots}`, spots === spec.spots, `gelesen: ${spots}`);
  }
  if (spec.pressed) {
    const value = await page.locator(SEL.buildMenu).getByRole('button', { name: spec.pressed }).getAttribute('aria-pressed');
    check(`${beat.id} — ${spec.pressed} ist gewählt`, value === 'true', `aria-pressed=${value}`);
  }
  if (spec.panel) {
    const text = await readPanel(page);
    check(`${beat.id} — das Panel meldet „${spec.panel}"`, text.includes(spec.panel), text.replace(/\n/g, ' | '));
  }
}

async function walkBeat(page, beat, memo) {
  if (beat.state && beat.within > 0) {
    const walk = await advanceUntil(hintWalk(page, HINTS[beat.state].text, beat.within));
    check(`${beat.id} — spätestens nach ${beat.within} ms`, walk.reached && walk.elapsed <= beat.within, `${walk.elapsed} ms`);
  }
  if (beat.waitFor) {
    const walk = await advanceUntil(panelWalk(page, beat.waitFor, beat.within));
    check(`${beat.id} — das Panel meldet „${beat.waitFor}"`, walk.reached, `nach ${walk.elapsed} ms`);
  }
  return readHud(page);
}

export async function runBeat({ page, beat, memo }) {
  try {
    if (beat.drive) await beat.drive({ page, memo });
    const hud = await walkBeat(page, beat, memo);
    if (typeof hud.essence === 'number') memo.essence = hud.essence;
    if (beat.expect) await checkHud({ beat, spec: beat.expect, hud, page });
    if (beat.shot) memo.shots.push(await shoot(page, beat.shot));
  } catch (reason) {
    const why = String(reason?.message ?? reason).split('\n')[0];
    check(`${beat.id} — der Schritt liess sich nicht ausfuehren`, false, why);
  }
}