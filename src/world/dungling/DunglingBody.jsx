/**
 * Der Körper ist kein Arbeiter, sondern ein Geschwur: eine weiche, lappige
 * Verdickung, die aus dem Hive wächst. Kein Gesicht, kein Lächeln — eine
 * Narbe, ein paar Adern und ein Kern, der durch die Haut schimmert.
 */
function BudShell() {
  return (
    <path
      d="M0,-19 C-9.4,-18.4 -14.2,-10.6 -13.4,-2.2 C-12.8,5.6 -7,11 0,11 C7,11 12.8,5.6 13.4,-2.2 C14.2,-10.6 9.4,-18.4 0,-19 Z"
      fill="url(#dl-bud)"
    />
  );
}

function BudLobes({ lobes }) {
  return lobes.map((lobe) => (
    <ellipse
      key={`lobe-${lobe.cx}-${lobe.cy}`}
      cx={lobe.cx}
      cy={lobe.cy}
      rx={lobe.r}
      ry={lobe.r * 0.78}
      fill="var(--color-hive-500)"
      opacity={lobe.opacity}
    />
  ));
}

function BudVeins() {
  return (
    <g stroke="var(--color-hive-400)" strokeWidth="1.1" fill="none" opacity="0.55" strokeLinecap="round">
      <path d="M-1.4,-15.4 C-3.6,-11 -2.6,-7.4 -4.4,-3.4" />
      <path d="M3.2,-14.2 C5.6,-10.4 4.2,-6.6 6.6,-2.8" />
      <path d="M-7.6,-9.4 C-4.6,-8.2 -2.2,-7.4 0.6,-6.2" />
    </g>
  );
}

function BudCore() {
  return (
    <>
      <ellipse cx="0.4" cy="-1.6" rx="4.6" ry="5.2" fill="url(#dl-coreHalo)" opacity="0.9" />
      <ellipse cx="0.4" cy="-1.6" rx="2" ry="2.4" fill="var(--color-core-400)" opacity="0.85" />
    </>
  );
}

function BudSkin() {
  return (
    <>
      <ellipse cx="-5.4" cy="-11" rx="4.2" ry="2.6" fill="var(--color-hive-300)" opacity="0.22" transform="rotate(-26 -5.4 -11)" />
      <path d="M-11.4,-1.4 C-6.4,3.4 6.4,3.4 11.4,-1.4" fill="none" stroke="var(--color-hive-800)" strokeWidth="2" opacity="0.4" />
    </>
  );
}

export function DunglingBody({ lobes }) {
  return (
    <>
      <BudShell />
      <BudLobes lobes={lobes} />
      <BudSkin />
      <BudVeins />
      <BudCore />
    </>
  );
}