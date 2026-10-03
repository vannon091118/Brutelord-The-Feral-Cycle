/**
 * Spuren auf dem Boden: Tritte des Hive-Eingangs oder kleine Moosspitzen auf
 * abgebautem Land. Beides erzählt, woher der Boden kommt.
 */
function BurrowPrints({ geometry }) {
  return (
    <g opacity="0.3">
      {[0, 1, 2].map((index) => (
        <ellipse
          key={`print-${index}`}
          cx={geometry.center.x - 3.5 + index * 2.4}
          cy={geometry.center.y + 12 - index * 9}
          rx="2.1"
          ry="1.5"
          fill="var(--color-soil-950)"
        />
      ))}
    </g>
  );
}

function MossTufts({ geometry }) {
  const { center } = geometry;
  return (
    <g opacity="0.6">
      <path
        d={`M${center.x - 11},${center.y + 12} q2,-5 4.6,-0.6`}
        fill="none"
        stroke="var(--color-moss-500)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M${center.x + 6},${center.y - 13} q2.2,-4.6 4.4,-0.8`}
        fill="none"
        stroke="var(--color-moss-500)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </g>
  );
}

export function FloorTraces({ geometry }) {
  return geometry.burrow ? <BurrowPrints geometry={geometry} /> : <MossTufts geometry={geometry} />;
}
