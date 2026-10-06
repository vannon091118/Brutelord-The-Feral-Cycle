/** Die Testfälle: realer Klick, echte Uhr, echte Konten-API. Jeder Fall fährt
 *  die Seite und prüft mit dem echten Zustand. Die Wege stehen in ROADMAP_OPEN.md. */
import { BUILDING_LABEL, SEL, mineOne, mineableEarth, panelText } from './lib/dl.mjs';
import { readState, readTilePhases, waitState } from './lib/probe.mjs';
import { countFloorTiles, createWorld } from '../../src/domain/world/grid.js';

const START_RAUM = countFloorTiles(createWorld());
const RAUM_NACH_ABBAU = START_RAUM + 1;

async function driveOnboarding(stage) {
  const { page, log, writeState } = stage;
  await page.locator(SEL.hive).click();
  await waitState(page, { label: 'Dungling', until: (s) => s.dunglings.length >= 1, timeoutMs: 15000, log });
  await waitState(page, { label: 'Wählbar', until: (s) => s.onboarding.state === 'TILE_SELECTION', timeoutMs: 15000, log });
  await mineOne(page, { label: 'Erstes Feld', log });
  await waitState(page, { label: 'Baumenü', until: (s) => s.buildMenuVisible, timeoutMs: 20000, log });
  await writeState('baumenue');
}

/** Der Brutlord ist 2 × 2, also wird weiter gebaut, statt aufzugeben. */
async function placeBuilding(stage, label) {
  const { page, log } = stage;
  const spot = page.locator(SEL.spot(label));
  for (let dug = 0; dug <= 4; dug += 1) {
    await page.locator(SEL.buildOption(label)).click();
    if ((await spot.count()) > 0) {
      await spot.first().click();
      return waitState(page, {
        label: `${label} ist bereit`,
        until: (s) => s.buildings.some((b) => b.type === typeOf(label) && b.state === 'READY'),
        timeoutMs: 180000,
        log,
      });
    }
    if (dug === 4) throw new Error(`Kein Bauplatz für ${label}, auch nach vier Feldern mehr`);
    log(`  Kein Bauplatz für ${label} — Feld ${dug + 1} abgebaut`);
    await mineOne(page, { label: `Raum für ${label}`, log });
  }
}

const TYPE_OF = Object.freeze({
  [BUILDING_LABEL.swarmHost]: 'SWARM_HOST',
  [BUILDING_LABEL.extractor]: 'ESSENCE_EXTRACTOR',
  [BUILDING_LABEL.bruteLord]: 'BRUTE_LORD',
});

function typeOf(label) {
  return TYPE_OF[label];
}

async function driveExtractor(stage) {
  const { page, log } = stage;
  const essenceBefore = (await readState(page)).essence;
  await placeBuilding(stage, BUILDING_LABEL.extractor);
  const lord = await panelText(page);
  await page.locator(SEL.panel).getByRole('button', { name: '+ Dungling' }).click();
  log(`Extractor steht (${lord.split('\n').find(Boolean) ?? 'Panel offen'})`);
  await waitState(page, { label: 'Essenz pumpt', until: (s) => s.essence > essenceBefore + 3, timeoutMs: 180000, log });
  await stage.writeState('extractor-laeuft');
}

async function driveSwarmHost(stage) {
  const { page, log } = stage;
  const before = (await readState(page)).dunglings.length;
  await placeBuilding(stage, BUILDING_LABEL.swarmHost);
  await waitState(page, { label: 'Zweiter Dungling', until: (s) => s.dunglings.length > before, timeoutMs: 90000, log });
  await stage.writeState('zwei-dunglinge');
}

async function driveBruteLord(stage) {
  const { page, log } = stage;
  const s0 = await readState(page);
  if (s0.buildings.some((b) => b.type === 'BRUTE_LORD')) {
    log('Brutlord steht schon — Labor wird direkt geöffnet');
  } else {
    while ((await readState(page)).essence < 10 && (await mineableEarth(page)).length > 0) {
      await mineOne(page, { label: 'Essenz für den Lord', log });
    }
    await placeBuilding(stage, BUILDING_LABEL.bruteLord);
  }
  await page.locator(SEL.panel).getByRole('button', { name: 'Labor öffnen' }).click();
  await page.locator(SEL.lab).waitFor({ timeout: 15000 });
  const buy = page.locator(SEL.lab).getByRole('button', { name: /Stein kaufen/ });
  if (await buy.isEnabled()) {
    await buy.click();
    log('Stein gekauft');
  } else {
    log('Stein-Kauf nicht möglich — Inventar bleibt leer, Fall bleibt dokumentiert');
  }
  await stage.writeState('labor-offen');
}

async function driveMutant(stage) {
  const { page, log } = stage;
  let s = await readState(page);
  if (s.lab.stones.length === 0) await driveBruteLord(stage);
  s = await readState(page);
  if (s.lab.stones.length === 0) {
    log('Kein Stein zu bekommen — Mutant-Szenario bleibt bei leerem Inventar');
    return;
  }
  await page.locator(SEL.stoneChip).first().click();
  await page.locator(SEL.slot('Kopf')).click();
  await page.locator(SEL.lab).getByRole('button', { name: /Erschaffen/ }).click();
  await waitState(page, { label: 'Mutant', until: (x) => x.dunglings.some((d) => (d.stones ?? []).length > 0), timeoutMs: 15000, log });
  await stage.writeState('mutant');
}

/** Snapshots: sichern, neu laden, prüfen dass er wiedersteht — verglichen wird
 *  gegen das, was gespeichert wurde, denn das Spiel läuft dazwischen weiter. */
async function driveSnapshot(stage) {
  const { page, log } = stage;
  const saved = await page.evaluate(() => {
    const state = window.__dl.save();
    const { tiles, ...world } = state.world;
    return { ...state, world };
  });
  log(`Snapshot gespeichert (Essenz ${saved.essence}, Bauten ${saved.buildings.length}). Neu laden…`);
  await page.reload();
  await page.locator(SEL.field).waitFor({ timeout: 30000 });
  const s1 = await readState(page);
  stage.check('Essenz überlebt den Reload', s1.essence === saved.essence, `${s1.essence} gegen ${saved.essence}`);
  stage.check('Onboarding-Phase überlebt', s1.onboarding.state === saved.onboarding.state, s1.onboarding.state);
  stage.check('Dunglinge überleben', s1.dunglings.length === saved.dunglings.length, `${s1.dunglings.length}`);
  stage.check('Bauten überleben', s1.buildings.length === saved.buildings.length, `${s1.buildings.length}`);
  stage.check('Labor überlebt', s1.lab.stones.length === saved.lab.stones.length, `${s1.lab.stones.length}`);
  await page.evaluate(() => window.__dl.clear());
}

async function driveAccount(stage) {
  const { page, log, base } = stage;
  const konto = `bremse-${Date.now()}`;
  const call = async (name, password, origin) =>
    page.request.post(`${base}api/login`, {
      data: { name, password },
      headers: origin ? { Origin: origin } : {},
    });
  const bad = [];
  for (let attempt = 1; attempt <= 5; attempt += 1) bad.push((await call(konto, 'falsches-passwort')).status());
  stage.check('5 Fehlversuche geben 401', bad.every((s) => s === 401), bad.join(','));
  stage.check('Der 6. Versuch ist gesperrt (429)', (await call(konto, 'richtig-passwort-9')).status() === 429);
  const other = await call(`${konto}-frei`, 'richtig-passwort-9');
  stage.check('Ein anderer Name bleibt frei', other.status() === 401, `${other.status()}`);
  const fremd = await call(konto, 'richtig-passwort-9', 'https://fremd.example');
  stage.check('Fremde Herkunft wird abgewiesen (403)', fremd.status() === 403, `${fremd.status()}`);
  log('Die Sperre läuft 60 s; sie bleibt, der Rest des Laufs muss sie nicht');
}

export const SCENARIOS = [
  { id: 'onboarding-complete', title: 'Onboarding: Hive → Dungling → ein Feld abgebaut, Baumenü offen', drive: driveOnboarding,
    check: async (stage) => {
      const s = await readState(stage.page);
      stage.check('Dungling lebt', s.dunglings.length === 1 && s.dunglings[0].state === 'IDLE');
      stage.check(`Raum ist ${RAUM_NACH_ABBAU}`, s.usableTileCount === RAUM_NACH_ABBAU, `${s.usableTileCount}`);
      stage.check('Baumenü steht', s.buildMenuVisible && s.onboarding.state === 'BUILD_MENU_VISIBLE');
    } },
  { id: 'extractor-loop', title: 'Bau: Extractor steht und presst Essenz', fixture: 'baumenue', drive: driveExtractor,
    check: async (stage) => {
      const s = await readState(stage.page);
      const ext = s.buildings.find((b) => b.type === 'ESSENCE_EXTRACTOR');
      stage.check('Extractor ist bereit', ext?.state === 'READY');
      stage.check('Dungling am Extractor', ext?.workers?.length === 1, String(ext?.workers?.length));
      stage.check('Essenz fließt über den Startwert', s.essence > 12, `${s.essence}`);
    } },
  { id: 'swarm-host-breeds', title: 'Brut: Schwarmhort brütet Dungling Nr. 2', fixture: 'extractor-laeuft', drive: driveSwarmHost,
    check: async (stage) => {
      const s = await readState(stage.page);
      stage.check('Zwei Dunglinge im Spiel', s.dunglings.length >= 2, `${s.dunglings.length}`);
      stage.check('Schwarmhort vorhanden', s.buildings.some((b) => b.type === 'SWARM_HOST'));
    } },
  { id: 'brute-lord-lab', title: 'Labor: Brutlord gebaut, Stein gekauft', fixture: 'zwei-dunglinge', drive: driveBruteLord,
    check: async (stage) => {
      const s = await readState(stage.page);
      stage.check('Brutlord ist gebaut', s.buildings.some((b) => b.type === 'BRUTE_LORD' && b.state === 'READY'));
      stage.check('Labor ist offen', s.lab.open === true);
      stage.check('Stein liegt im Inventar', s.lab.stones.length >= 1, `${s.lab.stones.length}`);
    } },
  { id: 'stone-mutant', title: 'Mutation: Stein in Slot, Mutant erschaffen', fixture: 'labor-offen', drive: driveMutant,
    check: async (stage) => {
      const s = await readState(stage.page);
      const mutant = s.dunglings.find((d) => (d.stones ?? []).length > 0);
      stage.check('Ein Dungling trägt Steine', Boolean(mutant), mutant ? `${mutant.stones.length} Stein(e)` : 'kein Mutant');
      if (mutant) stage.check('Stein verlässt den Laborplatz', !s.lab.stones.some((st) => st.seed === mutant.stones[0].seed && st.slot !== null));
    } },
  { id: 'rooting-spread', title: 'Wurzeln: abgebauter Boden wächst, Nachbarn bleiben dunkel', fixture: 'zwei-dunglinge', check: async (stage) => {
      const tiles = await readTilePhases(stage.page);
      const boden = tiles.filter((t) => t.kind === 'DUNGEON_FLOOR');
      const claimed = boden.filter((t) => t.phase === 'CLAIMED').length;
      stage.check('Der Boden ist verwurzelt', claimed > 0 && boden.every((t) => t.phase !== 'DARK'), `${claimed} von ${boden.length}`);
      const dark = tiles.filter((t) => t.kind === 'EARTH' && t.phase === 'DARK').length;
      stage.check('Die Erde drumherum bleibt dunkel', dark > 0, `${dark} Felder`);
    } },
  { id: 'snapshot-roundtrip', title: 'Snapshot: Zustand sichern, laden, weiterlaufen', fixture: 'mutant', drive: driveSnapshot },
  { id: 'account-throttle', title: 'Konto: 5×401 → 429, Name/Origin getrennt', drive: driveAccount },
];

export function scenarioList() {
  return SCENARIOS;
}
