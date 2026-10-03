const STEP_DUST = [
  { cx: -6, r: 1.8, delay: '0ms' },
  { cx: 0, r: 2.3, delay: '120ms' },
  { cx: 6, r: 2.8, delay: '240ms' },
];

function ToolHead() {
  return (
    <>
      <path d="M0,0 l-5.6,5.4" fill="none" stroke="var(--color-soil-700)" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M-8.6,3.6 l4.6,-1.6 2.4,4.2 -5.2,1.4 z" fill="var(--color-bone-300)" />
      <path d="M-8.6,3.6 l4.6,-1.6 0.9,1.6 -4.6,1.6 z" fill="var(--color-soil-300)" opacity="0.8" />
    </>
  );
}

function Tool({ working }) {
  return (
    <g className={working ? 'dl-anim dl-tool' : undefined} transform="translate(-14 3)" opacity={working ? 1 : 0.9}>
      <ToolHead />
    </g>
  );
}

function StepDust({ moving }) {
  if (!moving) return null;
  return STEP_DUST.map((dust) => (
    <circle
      key={`step-${dust.cx}`}
      className="dl-anim dl-puff"
      cx={dust.cx}
      cy="9"
      r={dust.r}
      fill="var(--color-soil-400)"
      opacity="0.35"
      style={{ animationDelay: dust.delay, animationDuration: '520ms' }}
    />
  ));
}

/** Knochen-Meißel und die kleine Staubspur beim Laufen. */
export function DunglingTool({ working, moving }) {
  return <><Tool working={working} /><StepDust moving={moving} /></>;
}
