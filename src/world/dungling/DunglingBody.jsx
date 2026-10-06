// @doc: docs/daten/dungling/dunglingbody.md#dunglingbody
function BudShell({ shell }) {
  return <path d={shell} fill="url(#dl-bud)" />;
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
    <g stroke="var(--color-hive-400)" strokeWidth="1.1" fill="none" opacity="0.55" strokeLinecap="round">
      {veins.map((vein) => <path key={vein} d={vein} />)}
    </g>
  );
}

function BudCore({ scale }) {
  return (
    <>
      <ellipse cx="0.4" cy="-1.6" rx={4.6 * scale} ry={5.2 * scale} fill="url(#dl-coreHalo)" opacity="0.9" />
      <ellipse cx="0.4" cy="-1.6" rx={2 * scale} ry={2.4 * scale} fill="var(--color-core-400)" opacity="0.85" />
    </>
  );
}

function BudSkin({ shine, scale }) {
  return (
    <>
      <ellipse cx={shine.cx} cy={shine.cy} rx={shine.rx} ry={shine.ry} fill="var(--color-hive-300)" opacity="0.22" transform={`rotate(${shine.rot} ${shine.cx} ${shine.cy})`} />
      <path d={`M${-11.4 * scale},-1.4 C${-6.4 * scale},${3.4 * scale} ${6.4 * scale},${3.4 * scale} ${11.4 * scale},-1.4`} fill="none" stroke="var(--color-hive-800)" strokeWidth="2" opacity="0.4" />
    </>
  );
}

export function DunglingBody({ look }) {
  return (
    <>
      <BudShell shell={look.shell} />
      <BudLobes lobes={look.lobes} />
      <BudSkin shine={look.shine} scale={look.scale} />
      <BudVeins veins={look.veins} />
      <BudCore scale={look.scale} />
    </>
  );
}
