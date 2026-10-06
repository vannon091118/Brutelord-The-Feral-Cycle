const STEP_DUST = [
  { cx: -6, r: 1.8, delay: '0ms' },
  { cx: 0, r: 2.3, delay: '120ms' },
  { cx: 6, r: 2.8, delay: '240ms' },
];
const STRIKE = ['M6,-11 L11,-15', 'M9,-6 L15,-7', 'M3,-14 L6,-19'];

// @doc: docs/daten/dungling/dunglingtool.md#dunglingtool
function RootTeeth() {
  return (
    <g>
      <path d="M-9,1.6 C-6.6,2.4 -5.4,4.2 -4.6,6.4" fill="none" stroke="var(--color-hive-600)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-4.8,7 L-1.6,5.6 -1,9 -4.4,9.6 Z" fill="var(--color-bone-300)" />
      <path d="M-11.4,5.2 L-8.8,4.4 -8.2,7.8 -11,8.4 Z" fill="var(--color-bone-200)" opacity="0.85" />
      <path d="M-7.6,10 L-4.8,9.4 -4.4,12 -7.2,12.4 Z" fill="var(--color-bone-300)" opacity="0.7" />
    </g>
  );
}

function Strike() {
  return (
    <g className="dl-creature-strike" transform="translate(-15 2)" stroke="var(--color-bone-100)" strokeWidth="1.5" strokeLinecap="round">
      {STRIKE.map((ray) => <path key={ray} d={ray} />)}
    </g>
  );
}

function Tool({ working }) {
  return (
    <g className={working ? 'dl-anim dl-tool' : undefined} transform="translate(-15 2)" opacity={working ? 1 : 0.85}>
      <RootTeeth />
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

export function DunglingTool({ working, moving }) {
  return (
    <>
      <Tool working={working} />
      <Strike />
      <StepDust moving={moving} />
    </>
  );
}
