/** Prüft den Startzustand und die Wächter gegen unzulässige Befehle. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { HIVE_PHASE } from '../../src/domain/entities/hive.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { TILE_KIND, TILE_USABILITY, tileId } from '../../src/domain/world/tile.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';

const SPAWN_ID = tileId(ONBOARDING_CONFIG.dunglingSpawnTile.x, ONBOARDING_CONFIG.dunglingSpawnTile.y);
const FIRST_EARTH_ID = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y);

export function checkStart() {
  const initial = createInitialGameState();
  const firstEarth = initial.world.tiles[FIRST_EARTH_ID];
  section('Startzustand');
  check('Onboarding beginnt in INITIAL', initial.onboarding.state === 'INITIAL');
  check('Hive beginnt in DORMANT', initial.hive.phase === HIVE_PHASE.DORMANT);
  const hiveSize = initial.world.hiveSize;
  check('Hive belegt exakt seine konfigurierte Flaeche', Object.values(initial.world.tiles).filter((tile) => tile.kind === TILE_KIND.HIVE).length === hiveSize.width * hiveSize.height);
  check('Dungling-Start ist freier Hive-Eingang', initial.world.tiles[SPAWN_ID].kind === TILE_KIND.DUNGEON_FLOOR);
  check('Erde sichtbar, aber nicht nutzbar', firstEarth.visibility === 'VISIBLE' && firstEarth.usability === TILE_USABILITY.UNUSABLE);
  check('Ein nutzbares Feld, noch kein Baumenü', initial.usableTileCount === 1 && !initial.buildMenuVisible);
  check('Der Schwarm ist vor dem Spawn leer', initial.dunglings.length === 0);

  section('Unzulässige Befehle bleiben wirkungslos');
  const afterFarClick = gameReducer(initial, { type: ACTION.TILE_SELECTED, tileId: '0,0' });
  check('Weit entfernte Erde nicht auswählbar', afterFarClick === initial);
  const afterOrder = gameReducer(initial, { type: ACTION.MINING_ORDERED });
  check('Abbau ohne Auswahl startet nicht', afterOrder === initial);
  const afterEarlySpawn = gameReducer(initial, { type: ACTION.DUNGLING_SPAWNED });
  check('Vorzeitiger Spawn wird abgewiesen', afterEarlySpawn === initial);
  const afterClick = gameReducer(initial, { type: ACTION.HIVE_CLICKED });
  check('Hive-Klick startet genau eine Mutation', afterClick.hive.phase === HIVE_PHASE.MUTATING);
  check('Zweiter Hive-Klick wird ignoriert', gameReducer(afterClick, { type: ACTION.HIVE_CLICKED }) === afterClick);
}
