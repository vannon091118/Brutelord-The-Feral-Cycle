// @doc: docs/daten/floor/floorsubstrate.md#floorsubstrate
function Mark({ mark }) {
  if (mark.kind === 'poly') {
    return <polygon points={mark.points} fill={mark.fill} opacity={mark.opacity} />;
  }
  if (mark.kind === 'line') {
    return (
      <path
        d={mark.d}
        fill="none"
        stroke={mark.stroke}
        strokeWidth={mark.width}
        strokeLinecap="round"
        opacity={mark.opacity}
      />
    );
  }
  return <circle cx={mark.cx} cy={mark.cy} r={mark.r} fill={mark.fill} opacity={mark.opacity} />;
}

export function FloorSubstrate({ geometry }) {
  const clip = `dl-bed-${geometry.seed}`;

  return (
    <g>
      <clipPath id={clip}>
        <path d={geometry.mass} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {geometry.marks.map((mark) => (
          <Mark key={mark.key} mark={mark} />
        ))}
      </g>
    </g>
  );
}