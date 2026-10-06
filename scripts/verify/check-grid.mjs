/** Unit tests for neighborIds from world grid. */
import { neighborIds } from '../../src/domain/world/grid.js';
import { tileId } from '../../src/domain/world/tile.js';
import { check, section } from './expect.mjs';

export function checkGrid() {
  section('Nachbarn im Raster (neighborIds)');

  const world = { width: 10, height: 10 };

  const mitte = neighborIds(world, tileId(5, 5));
  check('Eine Kachel in der Mitte hat 4 Nachbarn', mitte.length === 4, mitte.join(', '));
  check('Die Nachbarn sind korrekt berechnet', mitte.includes(tileId(6, 5)) && mitte.includes(tileId(4, 5)) && mitte.includes(tileId(5, 6)) && mitte.includes(tileId(5, 4)));

  const linkeKante = neighborIds(world, tileId(0, 5));
  check('Eine Kachel an der linken Kante hat 3 Nachbarn', linkeKante.length === 3, linkeKante.join(', '));
  check('Es gibt keinen Nachbarn mit x = -1', !linkeKante.includes(tileId(-1, 5)));

  const obereKante = neighborIds(world, tileId(5, 0));
  check('Eine Kachel an der oberen Kante hat 3 Nachbarn', obereKante.length === 3, obereKante.join(', '));
  check('Es gibt keinen Nachbarn mit y = -1', !obereKante.includes(tileId(5, -1)));

  const rechteKante = neighborIds(world, tileId(9, 5));
  check('Eine Kachel an der rechten Kante hat 3 Nachbarn', rechteKante.length === 3, rechteKante.join(', '));
  check('Es gibt keinen Nachbarn mit x = 10', !rechteKante.includes(tileId(10, 5)));

  const untereKante = neighborIds(world, tileId(5, 9));
  check('Eine Kachel an der unteren Kante hat 3 Nachbarn', untereKante.length === 3, untereKante.join(', '));
  check('Es gibt keinen Nachbarn mit y = 10', !untereKante.includes(tileId(5, 10)));

  const ecke = neighborIds(world, tileId(0, 0));
  check('Eine Kachel in der Ecke hat 2 Nachbarn', ecke.length === 2, ecke.join(', '));
  check('Die Nachbarn der Ecke (0,0) sind (1,0) und (0,1)', ecke.includes(tileId(1, 0)) && ecke.includes(tileId(0, 1)));
}
