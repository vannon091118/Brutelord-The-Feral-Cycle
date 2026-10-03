/**
 * Effekte: der Blitz der Mutation und die kleinen Marken für jede Geburt.
 * Rein visuell — sie folgen dem Zustand, sie erzeugen ihn nicht.
 */
const PUFFS = [
  { cx: -46, cy: -40, r: 7, delay: '0ms' },
  { cx: -15, cy: 32, r: 8.6, delay: '90ms' },
  { cx: 16, cy: -40, r: 10.2, delay: '180ms' },
  { cx: 47, cy: 32, r: 11.8, delay: '270ms' },
];

export function HiveMutationFx({ mutating }) {
  if (!mutating) return null;
  return (
    <>
      <circle className="dl-anim dl-core-open" cx="0" cy="-6" r="34" fill="url(#dl-coreHalo)" />
      {PUFFS.map((puff) => (
        <circle
          key={`puff-${puff.cx}-${puff.cy}`}
          className="dl-anim dl-puff"
          cx={puff.cx}
          cy={puff.cy}
          r={puff.r}
          fill="var(--color-core-400)"
          opacity="0.22"
          style={{ animationDelay: puff.delay }}
        />
      ))}
    </>
  );
}

export function HiveBirthMarks({ spawned }) {
  return (
    <>
      {Array.from({ length: Math.min(spawned, 4) }).map((_, index) => (
        <circle
          key={`birth-${index}`}
          cx={-30 + index * 20}
          cy="72"
          r="2.4"
          fill="var(--color-core-500)"
          opacity="0.7"
        />
      ))}
    </>
  );
}
