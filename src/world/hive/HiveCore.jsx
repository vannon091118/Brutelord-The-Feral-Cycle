/**
 * Der Kern: das organische Zentrum des Hive. Er bleibt ruhig atmend, bis der
 * Spieler ihn weckt — dann öffnet er sich sichtbar.
 */
export function HiveCore({ mutating }) {
  return (
    <>
      <ellipse cx="0" cy="-6" rx="17" ry="20" fill="var(--color-hive-800)" />
      <ellipse
        className={mutating ? 'dl-anim dl-core-open' : 'dl-anim dl-core-pulse'}
        cx="0"
        cy="-6"
        rx="11"
        ry="13.5"
        fill="url(#dl-core)"
        filter="url(#dl-softGlow)"
      />
      <ellipse cx="0" cy="-4" rx="4.2" ry="6.4" fill="var(--color-soil-950)" opacity="0.75" />
      <path
        d="M-6,-14 C-3,-18 4,-18 7,-13"
        fill="none"
        stroke="var(--color-core-300)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </>
  );
}
