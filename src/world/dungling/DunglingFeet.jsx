import { makeRng } from '../tile-shapes.js';

// @doc: docs/daten/dungling/dunglingfeet.md#dunglingfeet
const FIBERS = Array.from({ length: 4 }, (_, index) => ({
  dx: -7.4 + index * 5,
  r: 3 + (index % 2),
}));

function ContactShadow({ ground }) {
  return (
    <g className="dl-creature-ground">
      <ellipse cx="0" cy="11" rx="14.4" ry="4.6" fill={`url(#${ground})`} />
      <ellipse cx="0" cy="10.6" rx="8.4" ry="2.1" fill="var(--color-soil-950)" opacity="0.5" />
    </g>
  );
}

function StateRing() {
  return (
    <ellipse
      className="dl-creature-ring"
      cx="0"
      cy="10.8"
      rx="13.6"
      ry="4.4"
      fill="none"
      stroke="var(--color-core-300)"
      strokeWidth="1.2"
    />
  );
}

export function DunglingFeet({ step = 0, look }) {
  const rng = makeRng(0x51f3 + step * 17);
  return (
    <g>
      <ContactShadow ground={look.ids.ground} />
      <StateRing />
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
