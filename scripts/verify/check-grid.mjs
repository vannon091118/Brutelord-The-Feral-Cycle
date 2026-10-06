import { isInsideGrid } from '../../src/domain/world/grid.js';
import { check, section } from './expect.mjs';

export function checkGrid() {
  section('Grid Boundaries');
  const world = { width: 10, height: 5 };

  check('Inside: origin (0, 0) is inside', isInsideGrid(world, 0, 0) === true);
  check('Inside: middle is inside', isInsideGrid(world, 5, 2) === true);
  check('Inside: max x, max y is inside', isInsideGrid(world, 9, 4) === true);

  check('Outside: negative x is outside', isInsideGrid(world, -1, 0) === false);
  check('Outside: negative y is outside', isInsideGrid(world, 0, -1) === false);
  check('Outside: x equals width is outside', isInsideGrid(world, 10, 0) === false);
  check('Outside: y equals height is outside', isInsideGrid(world, 0, 5) === false);
  check('Outside: far outside is outside', isInsideGrid(world, 100, 100) === false);
}
