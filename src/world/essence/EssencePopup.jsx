/**
 * Das Essenzsymbol: ein kleiner Kern, der über dem Abladeort aufsteigt und
 * dabei verblasst. Dieselbe Form trägt der Dungling, solange er eine Essenz
 * bei sich hat — so ist auf einen Blick klar, wer unterwegs ist.
 */
function Spark({ scale = 1 }) {
  return (
    <g transform={`scale(${scale})`}>
      <path
        d="M0 -7.5 L5.4 0 L0 7.5 L-5.4 0 Z"
        fill="var(--color-core-400)"
        stroke="var(--color-core-600)"
        strokeWidth="1"
      />
      <path d="M0 -3.6 L2.6 0 L0 3.6 L-2.6 0 Z" fill="var(--color-core-300)" />
    </g>
  );
}

/** Die Last über dem Kopf: wer trägt, zeigt es. */
export function CarriedEssence({ position, tileSize }) {
  return (
    <g transform={`translate(${position.x} ${position.y - tileSize * 0.46})`} opacity="0.92">
      <g className="dl-anim dl-bob">
        <Spark scale={0.58} />
      </g>
    </g>
  );
}

/** Das +1 über dem Abladeort — kurz, lesbar, dann weg. */
export function EssencePopup({ at }) {
  return (
    <g transform={`translate(${at.x} ${at.y - 16})`}>
      <g className="dl-anim dl-popup">
        <Spark />
        <text x="9" y="4.8" fontSize="14" fontWeight="600" fill="var(--color-core-300)">
          +1
        </text>
      </g>
    </g>
  );
}
