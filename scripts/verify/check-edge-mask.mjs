/** Das Nachbarschafts-Byte: Erde verbindet sich mit Erde, Wand steht zur Unbekannten. */
import { TILE_KIND, TILE_VISIBILITY, createEarthTile, createFloorTile, createHiveTile, isVisible } from '../../src/domain/world/tile.js';
import { EDGE_MASK_BITS, edgeMask, hiddenMask, maskHas, sideFlags } from '../../src/domain/world/edge-mask.js';
import { allTiles, createWorld, tileAt } from '../../src/domain/world/grid.js';
import { earthGeometry } from '../../src/world/earth/earth-geometry.js';
import { check, section } from './expect.mjs';

const SEITEN = Object.freeze({ N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] });

function buildWorld() {
  const hive = new Set(['5,5', '6,5', '5,6', '6,6']);
  const boden = new Set(['5,7', '4,7', '3,7', '7,7', '6,7', '3,8', '2,9', '3,10', '4,9']);
  const tiles = [];
  for (let y = 0; y < 11; y += 1) {
    for (let x = 0; x < 11; x += 1) {
      const id = `${x},${y}`;
      tiles.push(hive.has(id) ? createHiveTile(x, y) : boden.has(id) ? createFloorTile(x, y) : createEarthTile(x, y));
    }
  }
  // Ein reines Erde-Paar: beide Seiten folgen der Nachbarregel, keiner Grenz exception.
  for (const [x, y] of [[3, 4], [4, 4]]) tiles[y * 11 + x] = createEarthTile(x, y);
  return { width: 11, height: 11, seed: 7, hiveOrigin: { x: 5, y: 5 }, hiveSize: { width: 2, height: 2 }, spawnTileId: '5,7', entrance: { x: 47, y: 47 }, rootingWorkIds: [], tiles };
}

function checkEdgeMask() {
  section('Nachbarschafts-Byte: Form folgt Nachbarn, nie dem Rechteck');
  const world = buildWorld();
  const offen = edgeMask(world, 4, 6);
  check('Erde oeffnet zur Freiflaeche', maskHas(offen, 'E') && maskHas(offen, 'S'), `Maske ${offen}`);
  check('und bleibt zu gegen Erde', !maskHas(offen, 'N') && !maskHas(offen, 'W'));
  check('Erde an Erde: beide Seiten geschlossen', !maskHas(edgeMask(world, 3, 4), 'E') && !maskHas(edgeMask(world, 4, 4), 'W'));
  const loch = edgeMask(world, 3, 9);
  const alle = EDGE_MASK_BITS.N | EDGE_MASK_BITS.E | EDGE_MASK_BITS.S | EDGE_MASK_BITS.W;
  check('Vier Freiflaechen oeffnen alle Seiten', loch === alle, `Maske ${loch}`);
  check('Am Weltrand ist die fehlende Zelle offen', maskHas(edgeMask(world, 0, 0), 'W') && maskHas(edgeMask(world, 0, 0), 'N'));
  check('sideFlags liest Woerter, kein Byte', JSON.stringify(sideFlags(offen)) === JSON.stringify({ N: false, E: true, S: true, W: false }));
}

function wandNurZuUnbekannt(welt) {
  return allTiles(welt).every((tile) => Object.keys(SEITEN).every((seite) => {
    if (!maskHas(hiddenMask(welt, tile.x, tile.y), seite)) return true;
    const nachbar = tileAt(welt, tile.x + SEITEN[seite][0], tile.y + SEITEN[seite][1]);
    return Boolean(nachbar) && nachbar.kind === TILE_KIND.EARTH && nachbar.visibility === TILE_VISIBILITY.HIDDEN;
  }));
}

function freiflaecheOhneWand(welt) {
  return allTiles(welt)
    .filter((tile) => tile.kind !== TILE_KIND.EARTH)
    .every((tile) => hiddenMask(welt, tile.x, tile.y) === 0);
}

function checkHiddenMask() {
  section('Kantenwand: das Byte kennt die Unbekannte');
  const welt = createWorld();
  const wand = allTiles(welt).find((tile) => tile.kind === TILE_KIND.EARTH
    && isVisible(tile) && hiddenMask(welt, tile.x, tile.y) !== 0);
  check('Sichtbare Erde am Unbekannten traegt die Wand', Boolean(wand));
  check('Zur fehlenden Zelle am Rand steht keine Wand', allTiles(welt).every((tile) => {
    if (tile.x === 0 && maskHas(hiddenMask(welt, tile.x, tile.y), 'W')) return false;
    if (tile.y === 0 && maskHas(hiddenMask(welt, tile.x, tile.y), 'N')) return false;
    if (tile.x === welt.width - 1 && maskHas(hiddenMask(welt, tile.x, tile.y), 'E')) return false;
    if (tile.y === welt.height - 1 && maskHas(hiddenMask(welt, tile.x, tile.y), 'S')) return false;
    return true;
  }));
  check('Die Wand steht nur zu verborgener Erde', wandNurZuUnbekannt(welt));
  check('Freiflaeche traegt keine Wand', freiflaecheOhneWand(welt));
  const karte = (lauf) => allTiles(lauf)
    .map((tile) => `${tile.id}:${edgeMask(lauf, tile.x, tile.y)}:${hiddenMask(lauf, tile.x, tile.y)}`)
    .join('|');
  check('Das Byte ist reproduzierbar', karte(createWorld()) === karte(welt));
}

function checkGeometryFlow() {
  section('Verdrahtung: das Byte fliesst in die Geometrie');
  const welt = createWorld();
  const kachel = allTiles(welt).find((tile) => tile.kind === TILE_KIND.EARTH
    && isVisible(tile) && edgeMask(welt, tile.x, tile.y) !== 0);
  check('Die Frontier hat einen Block mit offener Seite', Boolean(kachel));
  const blind = earthGeometry({ tile: kachel, size: 64 });
  const naiv = earthGeometry({ tile: kachel, size: 64, world: welt });
  check('Ohne Welt wulstig, mit Welt flach', blind.mass !== naiv.mass);
  check('Der Cache haelt an gleicher Nachbarschaft', earthGeometry({ tile: kachel, size: 64, world: welt }) === naiv);
  const traeger = allTiles(welt).find((tile) => tile.kind === TILE_KIND.EARTH && hiddenMask(welt, tile.x, tile.y) !== 0);
  if (!traeger) {
    check('Ein Wandtraeger existiert', false);
    return;
  }
  const wand = earthGeometry({ tile: traeger, size: 64, world: welt });
  check('Die Wand liegt in der Geometrie', wand.walls.length > 0, `${wand.walls.length} Baender`);
  check('und nur als Band einer unbekannten Seite', wand.walls.every((band) => ['N', 'E', 'S', 'W'].some((seite) => band.key === `band-${seite}`)));
}

export function checkEdgeMaskGroup() {
  checkEdgeMask();
  checkHiddenMask();
  checkGeometryFlow();
}
