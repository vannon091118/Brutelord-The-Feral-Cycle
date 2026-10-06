// @doc: docs/daten/dungling/organic-skin.md#organic-skin
import { SKIN_TEXTURE } from '../../domain/brutelord/genome-config.js';
import { DUNGLING_STATE } from '../../domain/entities/dungling.js';
import { DunglingSvg } from '../Dungling.svg.jsx';

const TILE = 18;
const BASE_SIZE = 120;
const BASE_Y = 10;

export const INK = '#150c05';

export const SKIN_TONE = Object.freeze({
  [SKIN_TEXTURE.FLESH]: { hide: '#a2623a', bone: '#67351a', rim: '#f3c69b', shade: '#2a1207' },
  [SKIN_TEXTURE.CHITIN]: { hide: '#6a4f96', bone: '#3a2568', rim: '#c8abff', shade: '#170e2b' },
  [SKIN_TEXTURE.SLIME]: { hide: '#4f9e6d', bone: '#2a6440', rim: '#a9ffd2', shade: '#0c2418' },
  [SKIN_TEXTURE.BONE]: { hide: '#cdc2a2', bone: '#948868', rim: '#fff4d0', shade: '#2f2a1c' },
});

const MOTTLE = [[2, 3, 2.2], [10, 1, 1.4], [14, 8, 2.6], [5, 11, 1.8], [1, 15, 1.2], [11, 15, 2]];
const PLATES = [3.5, 8, 12.5, 17];
const BUBBLES = [[4, 5, 3.4], [12, 11, 4.2], [3, 15, 2.2], [15, 3, 2.6]];
const CRACKS = [[0, 4, 9, 8], [9, 8, 18, 2], [3, 17, 14, 11]];

const BASE = Object.freeze({
  id: 'mutant-base',
  tile: { x: 0, y: 0 },
  facing: 1,
  state: DUNGLING_STATE.IDLE,
  targetTileId: null,
  job: null,
  stones: [],
  invested: 0,
  battleEp: 0,
});

export function plot(point, view) {
  return { x: point.x * view.scale, y: (view.midY - point.y) * view.scale };
}

export function skinIds(id) {
  return { skin: `dl-skin-${id}`, wash: `dl-wash-${id}` };
}

function marks(skin, tone) {
  if (skin === SKIN_TEXTURE.CHITIN) {
    return PLATES.map((y) => <rect key={y} x="0" y={y} width={TILE} height="1.5" fill={tone.bone} opacity="0.75" />);
  }
  if (skin === SKIN_TEXTURE.SLIME) {
    return BUBBLES.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="none" stroke={tone.rim} strokeWidth="1.2" opacity="0.5" />);
  }
  if (skin === SKIN_TEXTURE.BONE) {
    return CRACKS.map(([x1, y1, x2, y2]) => <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={tone.bone} strokeWidth="1.1" />);
  }
  return MOTTLE.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={tone.bone} opacity="0.5" />);
}

export function SkinDefs({ id, skin }) {
  const tone = SKIN_TONE[skin];
  const ids = skinIds(id);
  return (
    <defs>
      <radialGradient id={ids.wash} cx="34%" cy="24%" r="80%">
        <stop offset="0%" stopColor={tone.rim} stopOpacity="0.6" />
        <stop offset="58%" stopColor={tone.hide} stopOpacity="0.12" />
        <stop offset="100%" stopColor={tone.shade} stopOpacity="0.72" />
      </radialGradient>
      <pattern id={ids.skin} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
        <rect width={TILE} height={TILE} fill={tone.hide} />
        {marks(skin, tone)}
      </pattern>
    </defs>
  );
}

function bodyPath(frame) {
  return frame.rings.map((ring) => `M${ring.map((point) => {
    const at = plot(point, frame.view);
    return `${at.x.toFixed(1)} ${at.y.toFixed(1)}`;
  }).join('L')}Z`).join('');
}

function Underlay({ frame, tone }) {
  const { view } = frame;
  return (
    <g stroke={tone.bone} strokeLinecap="round" opacity="0.55">
      {frame.skeleton.bones.map((bone, index) => {
        const from = plot({ x: bone.x1, y: bone.y1 }, view);
        const to = plot({ x: bone.x2, y: bone.y2 }, view);
        return <line key={`b${index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeWidth={Math.max(1.4, (bone.r1 + bone.r2) * view.scale * 0.8)} />;
      })}
      {frame.skeleton.joints.map((joint, index) => {
        const at = plot(joint, view);
        return <circle key={`j${index}`} cx={at.x} cy={at.y} r={Math.max(1.2, joint.r * view.scale * 0.62)} fill={tone.bone} stroke="none" />;
      })}
    </g>
  );
}

export function OrganicBody({ frame, tone, id, phase }) {
  if (!frame) {
    return <DunglingSvg dungling={BASE} tileSize={BASE_SIZE} x={0} y={BASE_Y} step={phase} />;
  }
  const path = bodyPath(frame);
  const ids = skinIds(id);
  return (
    <>
      <path d={path} transform="translate(4 5)" fill={tone.shade} opacity="0.55" />
      <Underlay frame={frame} tone={tone} />
      <path d={path} fill={`url(#${ids.skin})`} opacity="0.88" />
      <path d={path} fill={`url(#${ids.wash})`} />
      <path d={path} fill="none" stroke={tone.rim} strokeWidth="2.2" strokeLinejoin="round" opacity="0.85" />
    </>
  );
}
