function BodyShell() {
  return (
    <path d="M0,-17.4 C-7.6,-17.4 -12.3,-11.6 -12.6,-4 C-13,3.6 -7.7,9.8 0,9.8 C7.7,9.8 13,3.6 12.6,-4 C12.3,-11.6 7.6,-17.4 0,-17.4 Z" fill="url(#dl-body)" />
  );
}

function BackPlates() {
  return (
    <>
      <path d="M-11.4,-9 C-13.6,-10.4 -14,-13.4 -12.2,-14.6 C-10.4,-15.8 -8.4,-14.4 -8.6,-12.2 Z" fill="var(--color-soil-700)" opacity="0.55" />
      <path d="M11.4,-9 C13.6,-10.4 14,-13.4 12.2,-14.6 C10.4,-15.8 8.4,-14.4 8.6,-12.2 Z" fill="var(--color-soil-700)" opacity="0.45" />
    </>
  );
}

function BellyAndGlint() {
  return (
    <>
      <path d="M0,-2.4 C-7.8,-2.4 -10.2,2 -8.2,6 C-6.2,9.6 6.2,9.6 8.2,6 C10.2,2 7.8,-2.4 0,-2.4 Z" fill="var(--color-bone-200)" opacity="0.24" />
      <ellipse cx="-5" cy="-10.4" rx="4.4" ry="2.6" fill="var(--color-bone-100)" opacity="0.18" transform="rotate(-24 -5 -10.4)" />
    </>
  );
}

function Arms() {
  return (
    <>
      <path d="M-11.6,-2.4 C-14.6,-0.4 -15.2,2.6 -13.4,4.4" fill="none" stroke="var(--color-clay-600)" strokeWidth="3" strokeLinecap="round" />
      <path d="M11.6,-2.4 C14.4,-0.8 15,1.6 13.6,3.4" fill="none" stroke="var(--color-clay-600)" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function DunglingBody() {
  return <><BodyShell /><BackPlates /><BellyAndGlint /><Arms /></>;
}
