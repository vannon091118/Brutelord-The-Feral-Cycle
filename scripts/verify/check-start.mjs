/** Prüft den Startzustand: Anfang, Maße, Sichtbarkeit, erster Schritt. */
import { HIVE_PHASE } from '../../src/domain/entities/hive.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { TILE_KIND, TILE_USABILITY, isVisible, parseTileId, tileId } from '../../src/domain/world/tile.js';
import { allTiles, countFloorTiles, createWorld, getTile } from '../../src/domain/world/grid.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { checkGuard } from './check-guard.mjs';
import { check, section } from './expect.mjs';

const SPAWN_ID = tileId(ONBOARDING_CONFIG.dunglingSpawnTile.x, ONBOARDING_CONFIG.dunglingSpawnTile.y);
const FIRST_EARTH_ID = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y);

/** Jede Kachel-Id muss ihren Platz im Raster genau wiederfinden. */
function checkTileIds(world) {
  section('Kachel-Ids');
  const falsch = allTiles(world).filter((tile) => {
    const { x, y } = parseTileId(tile.id);
    return x !== tile.x || y !== tile.y || tileId(x, y) !== tile.id;
  });
  check(`Alle ${world.width * world.height} Kachel-Ids lesen sich zurueck`, falsch.length === 0, falsch.slice(0, 3).map((tile) => tile.id).join(', '));
  check('Die Id einer Kachel ist ihr Platz im Raster', allTiles(world).every((tile) => getTile(world, tile.id) === tile));
}

export function checkStart() {
  const initial = createInitialGameState();
  const firstEarth = getTile(initial.world, FIRST_EARTH_ID);
  section('Startzustand');
  check('Onboarding beginnt in INITIAL', initial.onboarding.state === 'INITIAL');
  check('Hive beginnt in DORMANT', initial.hive.phase === HIVE_PHASE.DORMANT);
  const hiveSize = initial.world.hiveSize;
  check('Hive belegt exakt seine konfigurierte Flaeche', allTiles(initial.world).filter((tile) => tile.kind === TILE_KIND.HIVE).length === hiveSize.width * hiveSize.height);
  check('Dungling-Start ist freier Hive-Eingang', getTile(initial.world, SPAWN_ID).kind === TILE_KIND.DUNGEON_FLOOR);
  check('Erde sichtbar, aber nicht nutzbar', isVisible(firstEarth) && firstEarth.usability === TILE_USABILITY.UNUSABLE);
  check('Der Ring liegt frei, noch kein Baumenue', initial.usableTileCount === countFloorTiles(createWorld()) && !initial.buildMenuVisible);
  check('Der Schwarm ist vor dem Spawn leer', initial.dunglings.length === 0);
  checkTileIds(initial.world);
  checkGuard();
}
