const NODES = [
  { cx: -40, cy: 4, rx: 9, ry: 8, tone: 'hive-600', opacity: 0.9 },
  { cx: 44, cy: -4, rx: 8, ry: 7.5, tone: 'hive-600', opacity: 0.85 },
  { cx: -16, cy: -34, rx: 7, ry: 6, tone: 'hive-500', opacity: 0.9 },
  { cx: 22, cy: -30, rx: 6, ry: 5.5, tone: 'hive-500', opacity: 0.85 },
];
const PULSES = [
  { cx: -40, cy: 4, r: 3.4, delay: '0.4s', tone: 'core-500' },
  { cx: 44, cy: -4, r: 3, delay: '1.1s', tone: 'core-500' },
  { cx: -16, cy: -34, r: 2.6, delay: '1.7s', tone: 'core-400' },
];

function ShellLayers() {
  return (
    <>
      <ellipse cx="0" cy="6" rx="70" ry="66" fill="var(--color-soil-950)" opacity="0.45" />
      <path d="M-52,-42 C-68,-24 -70,6 -58,28 C-46,52 -22,68 2,68 C28,68 56,52 64,26 C72,-2 64,-34 46,-50 C26,-64 -30,-62 -52,-42 Z" fill="url(#dl-hiveShell)" />
      <path d="M-44,-34 C-58,-16 -58,10 -48,28 C-38,48 -18,58 2,58 C24,58 48,46 54,24 C60,0 52,-28 38,-40 C22,-52 -26,-50 -44,-34 Z" fill="url(#dl-hiveMid)" />
      <path d="M-32,-26 C-42,-10 -42,10 -34,24 C-26,38 -12,46 2,46 C20,46 38,36 42,20 C46,0 38,-22 28,-30 C14,-38 -18,-38 -32,-26 Z" fill="url(#dl-hiveTop)" opacity="0.92" />
    </>
  );
}

function ShellSeams() {
  return (
    <>
      <g fill="none" stroke="var(--color-hive-800)" strokeWidth="2.4" strokeLinecap="round" opacity="0.42">
        <path d="M-6,-52 C-30,-44 -44,-22 -46,4" />
        <path d="M10,-50 C36,-40 50,-16 50,8" />
        <path d="M-48,26 C-32,44 -10,54 12,54" />
        <path d="M52,20 C42,40 24,52 6,56" />
      </g>
      <path d="M-46,-32 C-34,-48 -10,-54 12,-50" fill="none" stroke="var(--color-bone-200)" strokeWidth="3" strokeLinecap="round" opacity="0.14" />
    </>
  );
}

function ShellNodes() {
  return (
    <>
      {NODES.map((node) => (
        <ellipse key={`node-${node.cx}-${node.cy}`} cx={node.cx} cy={node.cy} rx={node.rx} ry={node.ry} fill={`var(--color-${node.tone})`} opacity={node.opacity} />
      ))}
      {PULSES.map((pulse) => (
        <circle key={`pulse-${pulse.cx}-${pulse.cy}`} className="dl-anim dl-core-pulse" cx={pulse.cx} cy={pulse.cy} r={pulse.r} fill={`var(--color-${pulse.tone})`} style={{ animationDelay: pulse.delay }} />
      ))}
    </>
  );
}

export function HiveShell() {
  return <><ShellLayers /><ShellSeams /><ShellNodes /></>;
}
