// @doc: docs/daten/dungling/dunglingbody.md#dunglingbody
function Materials({ ids }) {
  return (
    <defs>
      <linearGradient id={ids.shell} x1="0.22" y1="0" x2="0.62" y2="1">
        <stop offset="0%" stopColor="var(--color-hive-300)" />
        <stop offset="46%" stopColor="var(--color-hive-500)" />
        <stop offset="100%" stopColor="var(--color-hive-800)" />
      </linearGradient>
      <radialGradient id={ids.core}>
        <stop offset="0%" stopColor="var(--color-bone-100)" />
        <stop offset="40%" stopColor="var(--color-core-300)" />
        <stop offset="100%" stopColor="var(--color-core-500)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={ids.air}>
        <stop offset="0%" stopColor="var(--color-core-300)" stopOpacity="0.5" />
        <stop offset="58%" stopColor="var(--color-core-500)" stopOpacity="0.15" />
        <stop offset="100%" stopColor="var(--color-core-500)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={ids.ground}>
        <stop offset="0%" stopColor="var(--color-soil-950)" stopOpacity="0.72" />
        <stop offset="100%" stopColor="var(--color-soil-950)" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function BudShell({ shell, fill }) {
  return (
    <>
      <path d={shell} fill={fill} />
      <path d={shell} fill="var(--color-hive-800)" opacity="0.24" transform="translate(0 1.3)" />
      <path d={shell} fill="none" stroke="var(--color-hive-300)" strokeWidth="1.15" opacity="0.55" />
    </>
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
      fill={lobe.tone}
      opacity={lobe.opacity}
    />
  ));
}

function BudVeins({ veins }) {
  return (
    <g stroke="var(--color-hive-400)" strokeWidth="1.1" fill="none" opacity="0.62" strokeLinecap="round">
      {veins.map((vein) => <path key={vein} d={vein} />)}
    </g>
  );
}

function BudMotes({ pores }) {
  return (
    <g>
      {pores.map((pore, index) => (
        <circle
          key={`mote-${pore.cx}-${pore.cy}`}
          className="dl-creature-mote"
          cx={pore.cx}
          cy={pore.cy - 1.6}
          r={0.9 + pore.r}
          fill="var(--color-core-300)"
          style={{ animationDelay: `${index * 210}ms` }}
        />
      ))}
    </g>
  );
}

function BudCore({ core, scale }) {
  return (
    <>
      <ellipse cx="0.4" cy="-1.6" rx={6.2 * scale} ry={7 * scale} fill={`url(#${core})`} opacity="0.95" />
      <ellipse cx="0.4" cy="-1.6" rx={2 * scale} ry={2.4 * scale} fill="var(--color-core-400)" opacity="0.95" />
    </>
  );
}

function BudSkin({ shine, scale }) {
  return (
    <>
      <ellipse cx={shine.cx} cy={shine.cy} rx={shine.rx} ry={shine.ry} fill="var(--color-hive-300)" opacity="0.26" transform={`rotate(${shine.rot} ${shine.cx} ${shine.cy})`} />
      <ellipse cx={shine.cx - shine.rx * 0.2} cy={shine.cy - shine.ry * 0.15} rx={shine.rx * 0.42} ry={shine.ry * 0.4} fill="var(--color-bone-100)" opacity="0.16" transform={`rotate(${shine.rot} ${shine.cx} ${shine.cy})`} />
      <path d={`M${-11.4 * scale},-1.4 C${-6.4 * scale},${3.4 * scale} ${6.4 * scale},${3.4 * scale} ${11.4 * scale},-1.4`} fill="none" stroke="var(--color-hive-800)" strokeWidth="2" opacity="0.4" />
    </>
  );
}

export function DunglingBody({ look }) {
  const { ids } = look;
  return (
    <>
      <Materials ids={ids} />
      <ellipse className="dl-creature-air" cx="0" cy="-4" rx={15 * look.scale} ry={17 * look.scale} fill={`url(#${ids.air})`} />
      <BudShell shell={look.shell} fill={`url(#${ids.shell})`} />
      <BudLobes lobes={look.lobes} />
      <BudSkin shine={look.shine} scale={look.scale} />
      <BudVeins veins={look.veins} />
      <BudMotes pores={look.pores} />
      <BudCore core={ids.core} scale={look.scale} />
    </>
  );
}
