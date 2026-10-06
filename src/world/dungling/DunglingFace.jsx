// @doc: docs/daten/dungling/dunglingface.md#dunglingface
function Seam({ d }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--color-hive-800)"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.85"
    />
  );
}

function Pores({ pores }) {
  return (
    <g fill="var(--color-hive-800)" opacity="0.5">
      {pores.map((pore) => <circle key={`pore-${pore.cx}-${pore.cy}`} cx={pore.cx} cy={pore.cy} r={pore.r} />)}
    </g>
  );
}

function BudCrown({ crown, working }) {
  return (
    <g stroke="var(--color-hive-400)" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity={working ? 0.85 : 0.5}>
      {crown.map((tendril) => <path key={`crown-${tendril.at}`} d={tendril.d} />)}
    </g>
  );
}

export function DunglingFace({ working, look }) {
  return (
    <>
      <BudCrown crown={look.crown} working={working} />
      <Pores pores={look.pores} />
      <Seam d={working ? look.seam.work : look.seam.rest} />
    </>
  );
}
