function Eyes() {
  return (
    <g>
      <ellipse cx="-4.2" cy="-5.8" rx="3.2" ry="3.5" fill="var(--color-bone-100)" />
      <ellipse cx="4.4" cy="-5.8" rx="3.2" ry="3.5" fill="var(--color-bone-100)" />
      <ellipse cx="-3.8" cy="-5.4" rx="1.6" ry="1.9" fill="var(--color-soil-950)" />
      <ellipse cx="4.8" cy="-5.4" rx="1.6" ry="1.9" fill="var(--color-soil-950)" />
      <circle cx="-4.4" cy="-6.3" r="0.6" fill="var(--color-bone-100)" />
      <circle cx="4.2" cy="-6.3" r="0.6" fill="var(--color-bone-100)" />
    </g>
  );
}

function Squint() {
  return (
    <g fill="none" stroke="var(--color-soil-950)" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
      <path d="M-7.2,-5.6 q2.9,-2.7 5.8,0" />
      <path d="M1.6,-5.6 q2.9,-2.7 5.8,0" />
    </g>
  );
}

function Antennae() {
  return (
    <>
      <path d="M-3,-16.4 C-5,-21 -7,-23 -9.4,-23.6" fill="none" stroke="var(--color-soil-700)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.4,-16.4 C5.4,-21 7.4,-22.6 9.8,-23.2" fill="none" stroke="var(--color-soil-700)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="-9.6" cy="-23.7" r="1.8" fill="var(--color-core-400)" />
      <circle cx="10" cy="-23.3" r="1.8" fill="var(--color-core-400)" />
    </>
  );
}

function CheeksAndMouth({ working }) {
  return (
    <>
      <circle cx="-9" cy="-0.6" r="2.2" fill="var(--color-clay-500)" opacity="0.35" />
      <circle cx="9" cy="-0.6" r="2.2" fill="var(--color-clay-500)" opacity="0.35" />
      <path d={working ? 'M-2,3 q2.4,-1.2 4.8,0.4' : 'M-2.2,2 q2.4,1.9 4.6,-0.2'} fill="none" stroke="var(--color-soil-950)" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

/** Fühler, freundliche Augen und ein konzentrierter Ausdruck beim Arbeiten. */
export function DunglingFace({ working }) {
  return <><Antennae />{working ? <Squint /> : <Eyes />}<CheeksAndMouth working={working} /></>;
}
