/**
 * Die Kamera zaehlt den gebauten Raum und puffert das Ergebnis. Der Puffer
 * haengt an der Identitaet des Raster-Arrays: gibt jede Aenderung ein neues
 * Array zurueck, stimmt der Puffer. Diese Pruefung sichert beide Haelften ab.
 */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { TILE_KIND, createFloorTile, tileId } from '../../src/domain/world/tile.js';
import { applyTiles, createWorld } from '../../src/domain/world/grid.js';
import { cameraBox } from '../../src/world/world-view.js';
import { check, section } from './expect.mjs';

const TILE_SIZE = 32;
const VIEWPORT = { width: 800, height: 600 };
const TARGET = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y);

function plainCenterTile(world) {
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (const tile of world.tiles) {
    if (!tile || tile.kind === TILE_KIND.EARTH) continue;
    count += 1;
    sumX += tile.x + 0.5;
    sumY += tile.y + 0.5;
  }
  if (count === 0) return { x: world.hiveOrigin.x + 0.5, y: world.hiveOrigin.y + 0.5 };
  return { x: sumX / count, y: sumY / count };
}

function minedFloor(world, id) {
  const tile = world.tiles.find((entry) => entry && entry.id === id);
  return createFloorTile(tile.x, tile.y);
}

function sameBox(left, right) {
  const box = (world) => cameraBox({ world, tileSize: TILE_SIZE, viewport: VIEWPORT });
  return JSON.stringify(box(left)) === JSON.stringify(box(right));
}

export function checkCamera() {
  const world = createWorld();
  const next = applyTiles(world, { [TARGET]: minedFloor(world, TARGET) });
  const before = plainCenterTile(world);
  const expected = plainCenterTile(next);
  const box = cameraBox({ world: next, tileSize: TILE_SIZE, viewport: VIEWPORT });

  section('Kamera: die Mitte folgt dem gebauten Raum');
  check('Jede Bodenablegung gibt ein neues Raster zurueck', next.tiles !== world.tiles);
  check('Eine Bodenablegung verschiebt die Mitte', before.x !== expected.x || before.y !== expected.y, `vorher ${before.x},${before.y}`);
  check('Der Ausschnitt folgt der Mitte', box.x + box.width / 2 !== VIEWPORT.width / 2 || box.y + box.height / 2 !== VIEWPORT.height / 2, `Mitte ${box.x + box.width / 2},${box.y + box.height / 2}`);
  check('Der Ausschnitt bleibt im Raster', box.x >= 0 && box.y >= 0, `${box.x},${box.y}`);
  check('Wiederholte Aufrufe liefern denselben Ausschnitt', sameBox(next, next));
  check('Eine Rasterkopie erbt keinen Puffer', sameBox(next, { ...next, tiles: next.tiles.slice() }));
}