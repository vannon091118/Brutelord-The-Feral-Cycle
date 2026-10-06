import { isInsideGrid, createWorld } from '../../src/domain/world/grid.js';
import { check, section } from './expect.mjs';

export function checkGrid() {
  section('Grid bounds checking (isInsideGrid)');

  const world = createWorld({ width: 10, height: 10 });

  // Happy path
  check('Point (0,0) is inside the grid', isInsideGrid(world, 0, 0) === true);
  check('Point in the middle is inside the grid', isInsideGrid(world, 5, 5) === true);
  check('Bottom-right edge is inside the grid', isInsideGrid(world, 9, 9) === true);

  // Edge cases - negative coordinates
  check('Negative x is outside the grid', isInsideGrid(world, -1, 5) === false);
  check('Negative y is outside the grid', isInsideGrid(world, 5, -1) === false);
  check('Negative x and y is outside the grid', isInsideGrid(world, -1, -1) === false);

  // Edge cases - beyond width/height
  check('x equal to width is outside the grid', isInsideGrid(world, 10, 5) === false);
  check('y equal to height is outside the grid', isInsideGrid(world, 5, 10) === false);
  check('x beyond width is outside the grid', isInsideGrid(world, 11, 5) === false);
  check('y beyond height is outside the grid', isInsideGrid(world, 5, 11) === false);
}
