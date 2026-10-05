import { makeRng } from '../tile-shapes.js';

// @doc: docs/daten/dungling/dunglingfeet.md#dunglingfeet
const FIBERS = Array.from({ length: 4 }, (_, index) => ({
  dx: -7.4 + index * 5,
  r: 3 + (index % 2),
}));

export function DunglingFeet({ step = 0 }) {
  const rng = makeRng(0x51f3 + step * 17);
  return (
    <g>
      <ellipse cx="0" cy="10.4" rx="11.4" ry="3.1" fill="var(--color-soil-950)" opacity="0.45" />
      {FIBERS.map((fiber, index) => (
        <path
          key={`fiber-${index}`}
          d={`M${fiber.dx},6.4 C${fiber.dx - 2 + rng() * 4},9 ${fiber.dx - 4 + rng() * 6},12 ${fiber.dx - 6 + rng() * 8},13.4`}
          fill="none"
          stroke="var(--color-hive-600)"
          strokeWidth={fiber.r}
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
    </g>
  );
}