// @doc: docs/daten/rooting/tendrils.md#tendrils
import { crackPath, makeRng, tileSeed } from '../tile-shapes.js';

const ROOTS = [0, 1, 2, 3];

function rootBend({ x, y, size, seed, index, side }) {
  const along = 0.28 + (index % 2) * 0.44;
  const starts = [
    { cx: x + size * along, cy: y + 2 },
    { cx: x + size - 2, cy: y + size * along },
    { cx: x + size * (1 - along), cy: y + size - 2 },
    { cx: x + 2, cy: y + size * (1 - along) },
  ];
  const start = starts[side];
  return crackPath({
    x: (start.cx + x + size / 2) / 2 - size / 2,
    y: (start.cy + y + size / 2) / 2 - size / 2,
    size,
    seed: seed + index * 31,
    index: index + side * 5,
    spread: 0.42,
  });
}

export function tendrilsOf({ tile, size }) {
  const seed = tileSeed(tile.x, tile.y) ^ 0x7a17;
  const rng = makeRng(seed);
  const x = tile.x * size;
  const y = tile.y * size;

  return ROOTS.flatMap((side) => {
    const count = 1 + (rng() > 0.55 ? 1 : 0);
    return Array.from({ length: count }, (_, index) => ({
      key: `tendril-${side}-${index}`,
      d: rootBend({ x, y, size, seed, index, side }),
      width: 1.5 + rng() * 1.7,
      tone: rng() > 0.6 ? 'bright' : 'dark',
      delay: index * 0.18 + (side % 2) * 0.09,
    }));
  });
}
