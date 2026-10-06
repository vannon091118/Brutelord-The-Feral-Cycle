import { tileSeed } from '../../src/world/tile-shapes.js';
import { check, section } from './expect.mjs';

export function checkTileShapes() {
  section('Tile Shapes: tileSeed Edge Cases');

  // Determinism
  check('tileSeed(0, 0) is deterministic', tileSeed(0, 0) === tileSeed(0, 0));
  check('tileSeed(10, -5) is deterministic', tileSeed(10, -5) === tileSeed(10, -5));

  // Symmetry
  const seedXY = tileSeed(12, 34);
  const seedYX = tileSeed(34, 12);
  check('tileSeed ist asymmetrisch', seedXY !== seedYX);

  // Adjacent tiles
  const seed00 = tileSeed(0, 0);
  const seed01 = tileSeed(0, 1);
  const seed10 = tileSeed(1, 0);
  check('Benachbarte Kacheln haben verschiedene Seeds (x)', seed00 !== seed10);
  check('Benachbarte Kacheln haben verschiedene Seeds (y)', seed00 !== seed01);

  // Edge cases
  check('Negative Koordinaten liefern valides Ergebnis', typeof tileSeed(-1, -1) === 'number' && tileSeed(-1, -1) >= 0);
  check('Große Koordinaten liefern valides Ergebnis', typeof tileSeed(1000000, 1000000) === 'number' && tileSeed(1000000, 1000000) >= 0);

  // Return type
  const val00 = tileSeed(0, 0);
  check('Seed ist ein Integer', Number.isInteger(val00));
  check('Seed ist unsigned 32-bit (non-negative)', val00 >= 0);
}
