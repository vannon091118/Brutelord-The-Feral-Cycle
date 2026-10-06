// @doc: docs/daten/dungling/organic-features.md#organic-features
import { FEATURE_ANCHOR, SPECIES } from '../../domain/brutelord/genome-config.js';
import { INK, plot } from './organic-skin.jsx';

const JAW_STYLE = Object.freeze({
  [SPECIES.HUMAN]: Object.freeze({ count: 3, length: 0.15, width: 0.022, bend: 0 }),
  [SPECIES.DEMON]: Object.freeze({ count: 2, length: 0.3, width: 0.032, bend: 0.06 }),
  [SPECIES.INSECT]: Object.freeze({ count: 2, length: 0.13, width: 0.05, bend: 0.09 }),
  [SPECIES.SPIDER]: Object.freeze({ count: 2, length: 0.32, width: 0.026, bend: 0.14 }),
});

const HORN_STYLE = Object.freeze({
  [SPECIES.HUMAN]: Object.freeze({ length: 0.42, width: 0.055, bend: 0 }),
  [SPECIES.DEMON]: Object.freeze({ length: 0.54, width: 0.075, bend: 0.18 }),
  [SPECIES.INSECT]: Object.freeze({ length: 0.34, width: 0.042, bend: 0.06 }),
  [SPECIES.SPIDER]: Object.freeze({ length: 0.34, width: 0.05, bend: 0.12 }),
});

const OFFSETS = Object.freeze({ 2: [-1, 1], 3: [-1, 0, 1] });

function wedge({ anchor, view, length, width, bend = 0 }) {
  const { normal, point } = anchor;
  const side = { x: -normal.y, y: normal.x };
  const a = plot({ x: point.x + side.x * width, y: point.y + side.y * width }, view);
  const b = plot({ x: point.x - side.x * width, y: point.y - side.y * width }, view);
  const c = plot({ x: point.x + normal.x * length + side.x * bend, y: point.y + normal.y * length + side.y * bend }, view);
  return `${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
}

function along(anchor, step, span = 0.08) {
  const side = { x: -anchor.normal.y, y: anchor.normal.x };
  return { ...anchor, point: { x: anchor.point.x + side.x * span * step, y: anchor.point.y + side.y * span * step } };
}

function roundEye(at, tone) {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r="4.8" fill={INK} />
      <circle cx={at.x} cy={at.y} r="4.8" fill="none" stroke={tone.bone} strokeWidth="1" />
      <circle className="dl-creature-glint" cx={at.x - 1.5} cy={at.y - 1.5} r="1.6" fill={tone.rim} />
    </g>
  );
}

function clusterEye(at, tone) {
  return (
    <g>
      {[-1, 0, 1].map((step) => (
        <circle key={step} cx={at.x + step * 3.2} cy={at.y + Math.abs(step) * 1.6} r="2.1" fill={INK} stroke={tone.bone} strokeWidth="0.8" />
      ))}
      <circle className="dl-creature-glint" cx={at.x} cy={at.y} r="0.9" fill={tone.rim} />
    </g>
  );
}

function compoundEye(at, tone) {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r="5.6" fill={tone.shade} stroke={tone.rim} strokeWidth="1" />
      <line x1={at.x - 5.6} y1={at.y} x2={at.x + 5.6} y2={at.y} stroke={tone.rim} strokeWidth="0.9" />
      <line x1={at.x} y1={at.y - 5.6} x2={at.x} y2={at.y + 5.6} stroke={tone.rim} strokeWidth="0.9" />
      <circle className="dl-creature-glint" cx={at.x - 1.8} cy={at.y - 1.8} r="1.1" fill={tone.rim} />
    </g>
  );
}

function slitEye(at, tone) {
  return (
    <g>
      <polygon points={`${at.x - 5},${at.y} ${at.x},${at.y - 4.4} ${at.x + 5},${at.y} ${at.x},${at.y + 4.4}`} fill={INK} stroke={tone.rim} strokeWidth="1" />
      <circle className="dl-creature-glint" cx={at.x} cy={at.y} r="1.5" fill={tone.rim} />
    </g>
  );
}

function Eye({ anchor, view, tone, species }) {
  const at = plot(anchor.point, view);
  if (species === SPECIES.SPIDER) return clusterEye(at, tone);
  if (species === SPECIES.INSECT) return compoundEye(at, tone);
  if (species === SPECIES.DEMON) return slitEye(at, tone);
  return roundEye(at, tone);
}

function Jaw({ anchor, view, species }) {
  const style = JAW_STYLE[species] ?? JAW_STYLE[SPECIES.HUMAN];
  return (
    <g>
      {(OFFSETS[style.count] ?? OFFSETS[3]).map((step) => (
        <polygon
          key={step}
          points={wedge({ anchor: along(anchor, step), view, length: style.length, width: style.width, bend: style.bend * Math.sign(step) })}
          fill={INK}
        />
      ))}
    </g>
  );
}

function Antenna({ anchor, view, tone }) {
  const { normal, point } = anchor;
  const base = plot(point, view);
  const tip = plot({ x: point.x + normal.x * 0.72, y: point.y + normal.y * 0.72 }, view);
  return (
    <g>
      <line x1={base.x} y1={base.y} x2={tip.x} y2={tip.y} stroke={INK} strokeWidth="1.5" />
      <circle cx={tip.x} cy={tip.y} r="1.7" fill={tone.rim} />
    </g>
  );
}

function Horn({ anchor, view, tone, species }) {
  if (species === SPECIES.INSECT) return <Antenna anchor={anchor} view={view} tone={tone} />;
  const style = HORN_STYLE[species] ?? HORN_STYLE[SPECIES.HUMAN];
  return <polygon points={wedge({ anchor, view, length: style.length, width: style.width, bend: style.bend })} fill={tone.rim} stroke={tone.shade} strokeWidth="0.6" />;
}

export function Features({ anchors, view, tone, species = SPECIES.HUMAN }) {
  return (
    <g>
      {anchors.map((anchor, index) => {
        if (anchor.role === FEATURE_ANCHOR.EYE_SOCKET) return <Eye key={index} anchor={anchor} view={view} tone={tone} species={species} />;
        if (anchor.role === FEATURE_ANCHOR.JAW) return <Jaw key={index} anchor={anchor} view={view} species={species} />;
        if (anchor.role === FEATURE_ANCHOR.HEAD_TIP) return <Horn key={index} anchor={anchor} view={view} tone={tone} species={species} />;
        if (anchor.role === FEATURE_ANCHOR.LIMB_TIP) return <polygon key={index} points={wedge({ anchor, view, length: 0.26, width: 0.05 })} fill={tone.bone} />;
        return <polygon key={index} points={wedge({ anchor, view, length: 0.3, width: 0.055 })} fill={tone.bone} stroke={tone.shade} strokeWidth="0.5" />;
      })}
    </g>
  );
}
