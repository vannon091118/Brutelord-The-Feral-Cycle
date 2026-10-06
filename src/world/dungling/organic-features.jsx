// @doc: docs/daten/dungling/organic-features.md#organic-features
import { FEATURE_ANCHOR } from '../../domain/brutelord/genome-config.js';
import { INK, plot } from './organic-skin.jsx';

const BITES = [-1, 0, 1];

function wedge({ anchor, view, length, width }) {
  const { normal, point } = anchor;
  const a = plot({ x: point.x + normal.y * width, y: point.y - normal.x * width }, view);
  const b = plot({ x: point.x - normal.y * width, y: point.y + normal.x * width }, view);
  const c = plot({ x: point.x + normal.x * length, y: point.y + normal.y * length }, view);
  return `${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
}

function Eye({ anchor, view, tone }) {
  const at = plot(anchor.point, view);
  return (
    <g>
      <circle cx={at.x} cy={at.y} r="4.8" fill={INK} />
      <circle cx={at.x} cy={at.y} r="4.8" fill="none" stroke={tone.bone} strokeWidth="1" />
      <circle cx={at.x - 1.5} cy={at.y - 1.5} r="1.6" fill={tone.rim} />
    </g>
  );
}

function Teeth({ anchor, view }) {
  const { normal, point } = anchor;
  const along = { x: -normal.y, y: normal.x };
  return BITES.map((step) => (
    <polygon
      key={step}
      points={wedge({
        anchor: { normal, point: { x: point.x + along.x * step * 0.08, y: point.y + along.y * step * 0.08 } },
        view,
        length: 0.15,
        width: 0.022,
      })}
      fill={INK}
    />
  ));
}

export function Features({ anchors, view, tone }) {
  return (
    <g>
      {anchors.map((anchor, index) => {
        if (anchor.role === FEATURE_ANCHOR.EYE_SOCKET) return <Eye key={index} anchor={anchor} view={view} tone={tone} />;
        if (anchor.role === FEATURE_ANCHOR.JAW) return <g key={index}><Teeth anchor={anchor} view={view} /></g>;
        if (anchor.role === FEATURE_ANCHOR.HEAD_TIP) return <polygon key={index} points={wedge({ anchor, view, length: 0.42, width: 0.055 })} fill={tone.rim} />;
        if (anchor.role === FEATURE_ANCHOR.LIMB_TIP) return <polygon key={index} points={wedge({ anchor, view, length: 0.26, width: 0.05 })} fill={tone.bone} />;
        return <polygon key={index} points={wedge({ anchor, view, length: 0.3, width: 0.055 })} fill={tone.bone} stroke={tone.shade} strokeWidth="0.5" />;
      })}
    </g>
  );
}
