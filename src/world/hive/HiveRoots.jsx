/**
 * Wurzeln und Steine am Fuß: verbinden den Hive mit der Erde und verankern ihn
 * sichtbar im Boden.
 */
export function HiveRoots() {
  return (
    <>
      <path
        d="M-70,22 C-88,26 -96,40 -86,52 C-78,62 -62,60 -56,50 Z"
        fill="var(--color-soil-800)"
        opacity="0.9"
      />
      <path
        d="M66,10 C86,16 92,32 80,44 C70,54 56,48 52,38 Z"
        fill="var(--color-soil-800)"
        opacity="0.85"
      />
      <path
        d="M-14,66 C-6,80 12,82 20,68 C24,60 12,56 2,58 Z"
        fill="var(--color-soil-800)"
        opacity="0.8"
      />

      <g fill="var(--color-soil-900)" opacity="0.85">
        <path d="M-64,-26 l16,-7 9,10 -13,9 z" />
        <path d="M54,-30 l15,8 -6,12 -14,-5 z" />
        <path d="M58,40 l16,4 -2,13 -15,-3 z" />
        <path d="M-58,46 l14,-3 3,12 -13,4 z" />
      </g>
    </>
  );
}
