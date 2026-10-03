/**
 * Kein Gesicht. Das Geschwur hat eine Narbe dort, wo ein Mund wäre, und ein
 * paar Poren, die atmen. Beim Arbeiten presst sich die Narbe zusammen.
 */
function Seam({ working }) {
  return (
    <path
      d={working ? 'M-3.4,-3.4 C-1.2,-1.6 1.2,-1.6 3.4,-3.4' : 'M-3.6,-4.2 C-1.2,-1.4 1.2,-1.4 3.6,-4.2'}
      fill="none"
      stroke="var(--color-hive-800)"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.85"
    />
  );
}

function Pores() {
  return (
    <g fill="var(--color-hive-800)" opacity="0.5">
      <circle cx="-6.6" cy="-7.4" r="0.9" />
      <circle cx="7.2" cy="-8.6" r="0.8" />
      <circle cx="-8.4" cy="-3.4" r="0.7" />
      <circle cx="9" cy="-2.6" r="0.9" />
    </g>
  );
}

function BudCrown({ working }) {
  return (
    <g stroke="var(--color-hive-400)" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity={working ? 0.85 : 0.5}>
      <path d="M-5.6,-17.2 C-6.6,-21 -5.4,-23.4 -3.4,-25" />
      <path d="M5.6,-17.2 C6.6,-21 5.4,-23.4 3.4,-25" />
    </g>
  );
}

/** Narbe statt Mund, Poren statt Augen. */
export function DunglingFace({ working }) {
  return (
    <>
      <BudCrown working={working} />
      <Pores />
      <Seam working={working} />
    </>
  );
}