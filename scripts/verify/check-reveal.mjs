/** Die Enthüllung bleibt eine Masse: kein umschlossenes Loch, keine dreiseitige Kerbe, kein Abriebstück. */
import { createFloorWorld } from '../../src/domain/world/floor.js';
import { TILE_KIND, TILE_VISIBILITY } from '../../src/domain/world/tile.js';
import { getTile, neighborIds } from '../../src/domain/world/grid.js';
import { revealAround } from '../../src/domain/world/reveal.js';
import { check, section } from './expect.mjs';

const PLAYERSEED = 2712847316;
const ETAGEN = [0, 4, 8];

function nachbarnOffen(world, x, y) {
  const seiten = [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]];
  return seiten.filter(([nx, ny]) => {
    const tile = nx < 0 || ny < 0 || nx >= world.width || ny >= world.height ? null : world.tiles[ny * world.width + nx];
    return Boolean(tile) && tile.visibility === TILE_VISIBILITY.VISIBLE;
  }).length;
}

function luecken(world) {
  let loch = 0;
  let kerbe = 0;
  for (const tile of world.tiles) {
    if (tile.kind !== TILE_KIND.EARTH || tile.visibility === TILE_VISIBILITY.VISIBLE) continue;
    const offen = nachbarnOffen(world, tile.x, tile.y);
    if (offen === 4) loch += 1;
    if (offen === 3) kerbe += 1;
  }
  return { loch, kerbe };
}

function massen(world) {
  const gesehen = new Set();
  let teile = 0;
  for (const start of world.tiles) {
    if (start.visibility !== TILE_VISIBILITY.VISIBLE || gesehen.has(start.id)) continue;
    teile += 1;
    const stapel = [start];
    gesehen.add(start.id);
    while (stapel.length > 0) {
      const tile = stapel.pop();
      for (const id of neighborIds(world, tile.id)) {
        const neben = getTile(world, id);
        if (!neben || neben.visibility !== TILE_VISIBILITY.VISIBLE || gesehen.has(id)) continue;
        gesehen.add(id);
        stapel.push(neben);
      }
    }
  }
  return teile;
}

function gespielt(world) {
  let next = world;
  for (const tile of world.tiles) {
    if (tile.kind === TILE_KIND.DUNGEON_FLOOR) next = revealAround(next, tile);
  }
  return next;
}

function pruefe(welt, label) {
  const fehler = luecken(welt);
  check(`${label}: kein umschlossenes Loch in der Erde`, fehler.loch === 0, `${fehler.loch} Löcher`);
  check(`${label}: keine dreiseitige Kerbe`, fehler.kerbe === 0, `${fehler.kerbe} Kerben`);
  check(`${label}: genau eine zusammenhaengende Masse`, massen(welt) === 1, `${massen(welt)} Massen`);
}

export function checkReveal() {
  section('Enthüllung: die sichtbare Erde bleibt eine Masse');
  for (const depth of ETAGEN) {
    const frisch = createFloorWorld(PLAYERSEED, depth);
    pruefe(frisch, `Etage ${depth} frisch`);
    pruefe(gespielt(frisch), `Etage ${depth} gespielt`);
  }
}
