/**
 * Die Regel aus dem Feedback: beansprucht wird ausschließlich abgebauter
 * Boden. Der Durchlauf macht aus einem Nachbarfeld des Wurzelankers
 * nachträglich Boden und lässt die Tentakel ein zweites Mal stoßen — Erde
 * daneben bleibt unbeansprucht, aber sichtbar.
 */
import { minedFloorTile } from '../../src/domain/actions/mining.js';
import { getTile, neighborIds, replaceTile } from '../../src/domain/world/grid.js';
import { ROOTING_PHASE } from '../../src/domain/world/rooting.js';
import { spreadToNeighbors } from '../../src/domain/world/rooting-world.js';
import { TILE_KIND, TILE_VISIBILITY } from '../../src/domain/world/tile.js';
import { check, section } from './expect.mjs';

export function checkClaim(slice) {
  const anchor = slice.targetTileId;
  const world = slice.state.world;
  const neighbors = neighborIds(world, anchor);
  const minedId = neighbors.find((id) => getTile(world, id).kind === TILE_KIND.EARTH);
  const prepared = replaceTile(world, minedFloorTile(getTile(world, minedId)));
  const spread = spreadToNeighbors(prepared, [anchor]);
  const earth = neighbors.filter((id) => getTile(spread, id).kind === TILE_KIND.EARTH);

  section('Beanspruchung: nur abgebauter Boden');
  check('Ein abgebautes Nachbarfeld wird beansprucht', getTile(spread, minedId).rooting.phase === ROOTING_PHASE.GROWING);
  check(
    'Unberührte Erde bleibt unbeansprucht',
    earth.length > 0 && earth.every((id) => getTile(spread, id).rooting.phase === ROOTING_PHASE.DARK),
  );
  check(
    'Der Weg der Wurzeln bleibt trotzdem sichtbar',
    earth.every((id) => getTile(spread, id).visibility === TILE_VISIBILITY.VISIBLE),
  );
}
