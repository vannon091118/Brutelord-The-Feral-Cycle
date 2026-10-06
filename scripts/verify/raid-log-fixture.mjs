/** Der einreichbare Lauf zu einem Ticket: marschieren, kaempfen, opfern, looten,
 *  heimkehren — jede Zeile ist eine abgesetzte Aktion. Ob das Log stimmt,
 *  entscheidet der Replay-Check des Servers und nicht diese Fixture. */
import { RAID_ACTION, RAID_STEP, neighborOf } from '../../src/domain/raid/raid-actions.js';
import { cellCost } from '../../src/domain/raid/raid-path.js';
import { createRaidState } from '../../src/domain/raid/raid-state.js';
import { applyAction } from '../../src/domain/raid/raid-steps.js';
import { createRaidWorld } from '../../src/domain/raid/raid-world.js';
import { raidLoot } from '../../src/domain/raid/raid-loot.js';
import { tileAt } from '../../src/domain/world/grid.js';

export function raidOpening({ ticket }) {
  return createRaidState(ticket);
}

function kennung(world, at) {
  return tileAt(world, at.x, at.y)?.id ?? null;
}

function richtung(from, to) {
  for (const type of RAID_STEP) {
    const point = neighborOf(from, { type });
    if (point.x === to.x && point.y === to.y) return type;
  }
  return null;
}

function pfadAus({ ziel, start, vor, ort }) {
  const pfad = [];
  for (let zeiger = ziel; zeiger !== start; zeiger = vor.get(zeiger)) pfad.unshift(ort.get(zeiger));
  return pfad;
}

/** Nach Kosten gesucht und nicht nach Feldern: ein Steinblock kostet sechs
 *  Ausdauer, Obsidian zwoelf — der kuerzeste Weg durch die Wand ist der teuerste. */
function weg(state, world, goal) {
  const start = kennung(world, state.at);
  const ziel = kennung(world, goal);
  if (!start || !ziel || start === ziel) return [];
  const preis = new Map([[start, 0]]);
  const vor = new Map();
  const ort = new Map([[start, state.at]]);
  const offen = [{ id: start, cost: 0 }];
  while (offen.length > 0) {
    offen.sort((links, rechts) => links.cost - rechts.cost);
    const hier = offen.shift();
    if (hier.cost > (preis.get(hier.id) ?? Infinity)) continue;
    if (hier.id === ziel) return pfadAus({ ziel, start, vor, ort });
    for (const type of RAID_STEP) {
      const nachbar = neighborOf(ort.get(hier.id), { type });
      const naechste = kennung(world, nachbar);
      if (!naechste) continue;
      const kosten = hier.cost + (naechste === ziel ? 0 : cellCost(state, world, naechste));
      if (!(kosten <= state.stamina) || kosten >= (preis.get(naechste) ?? Infinity)) continue;
      preis.set(naechste, kosten);
      vor.set(naechste, hier.id);
      ort.set(naechste, nachbar);
      offen.push({ id: naechste, cost: kosten });
    }
  }
  return null;
}

function gehe(lauf, at) {
  const type = richtung(lauf.state.at, at);
  if (type === null) return;
  const preis = cellCost(lauf.state, lauf.world, kennung(lauf.world, at));
  const gewaehlt = preis > 0 && Number.isFinite(preis) ? type.replace('MOVE', 'DIG') : type;
  lauf.actions.push({ type: gewaehlt });
  lauf.state = applyAction(lauf.state, lauf.world, { type: gewaehlt });
}

function marsch(lauf, goal) {
  for (const at of weg(lauf.state, lauf.world, goal) ?? []) gehe(lauf, at);
}

function schlag(lauf, type) {
  lauf.actions.push({ type });
  lauf.state = applyAction(lauf.state, lauf.world, { type });
}

function fechten(lauf) {
  for (let n = 0; n < 24 && lauf.state.wardens.some((wache) => !wache.coma); n += 1) schlag(lauf, RAID_ACTION.ATTACK);
}

function sturm(lauf) {
  for (let n = 0; n < 24 && lauf.state.hive.hp > 0; n += 1) schlag(lauf, RAID_ACTION.ATTACK);
}

function heimweg(lauf) {
  marsch(lauf, lauf.state.entry);
  if (lauf.state.secured) return;
  const ziel = lauf.state.entry;
  const umweg = RAID_STEP
    .map((type) => neighborOf(lauf.state.at, { type }))
    .find((at) => Boolean(kennung(lauf.world, at)) && (at.x !== ziel.x || at.y !== ziel.y));
  if (!umweg) return;
  gehe(lauf, umweg);
  marsch(lauf, ziel);
}

export function raidLogFor({ ticket }) {
  const lauf = { state: createRaidState(ticket), world: createRaidWorld({ snapshotSeed: ticket.snapshotSeed }), actions: [] };
  const hive = { x: lauf.world.hiveOrigin.x, y: lauf.world.hiveOrigin.y };
  marsch(lauf, hive);
  fechten(lauf);
  marsch(lauf, hive);
  sturm(lauf);
  schlag(lauf, RAID_ACTION.SACRIFICE);
  schlag(lauf, RAID_ACTION.LOOT);
  heimweg(lauf);
  return { actions: lauf.actions, claimed: lauf.state, loot: raidLoot(lauf.state), resolved: lauf.state.secured === true };
}
