/**
 * Die Stein-Overlays: eine Form je Slot, aus dem Seed gewaehlt. Welche Formen
 * es gibt, entscheidet die Formel in `mutation-formula.js` — diese Datei
 * zeichnet sie nur, und eine unbekannte Form bleibt einfach leer.
 */
import { STONE_DEFS, STONE_RARITY, STONE_SLOT } from '../../domain/brutelord/stone-config.js';
import { partFor } from './mutant-plan.js';

const TONE = Object.freeze({
  grau: '#9aa0a6',
  blau: '#5aa9ff',
  lila: '#b06cff',
  gold: '#ffcf5a',
});

const TONE_OPACITY = Object.freeze({
  grau: 0.35,
  blau: 0.45,
  lila: 0.55,
  gold: 0.7,
});

const AURA = Object.freeze({ base: 20, perPower: 5, maxOpacity: 0.4 });

function toneOf(rarity) {
  return TONE[STONE_DEFS[rarity].tone];
}

function toneOpacityOf(rarity) {
  return TONE_OPACITY[STONE_DEFS[rarity].tone];
}

function HeadForm({ form, r, tone }) {
  if (form === 'horn') return <path d="M-3,-30 L0,-40 L3,-30 Z" fill={tone} opacity="0.8" />;
  if (form === 'crest') return <path d="M-4,-28 Q0,-38 4,-28" fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round" />;
  if (form === 'antenna') return <path d="M0,-30 L2,-42 M-1.5,-38 L1.5,-38" stroke={tone} strokeWidth="1.5" fill="none" />;
  if (form === 'crown') return <path d="M-8,-32 L-4,-44 L0,-36 L4,-44 L8,-32 Z" fill={tone} opacity="0.85" />;
  if (form !== 'bud') return null;
  return <ellipse cx="0" cy={-28} rx={r * 0.3} ry={r * 0.5} fill={tone} opacity="0.7" />;
}

export function HeadOverlay({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.HEAD);
  if (!part) return null;
  const r = plan.head;
  const tone = toneOf(part.stone.rarity);
  return (
    <g>
      <ellipse cx="0" cy={-18 - r * 0.2} rx={r * 0.9} ry={r * 0.8} fill={tone} opacity={toneOpacityOf(part.stone.rarity)} />
      <HeadForm form={part.form} r={r} tone={tone} />
    </g>
  );
}

function TorsoForm({ form, rx, tone }) {
  if (form === 'shell') {
    return <path d={`M${-rx * 0.7},-8 C${-rx * 0.9},0 ${-rx * 0.7},${rx * 0.5} 0,${rx * 0.7} C${rx * 0.7},${rx * 0.5} ${rx * 0.9},0 ${rx * 0.7},-8`} fill="none" stroke={tone} strokeWidth="2" opacity="0.7" />;
  }
  if (form === 'hump') return <ellipse cx="0" cy="-12" rx={rx * 0.5} ry="8" fill={tone} opacity="0.6" />;
  if (form === 'ribcage') {
    return (
      <>
        <path d={`M${-rx * 0.6},-6 Q0,2 ${rx * 0.6},-6`} fill="none" stroke={tone} strokeWidth="1.5" opacity="0.5" />
        <path d={`M${-rx * 0.5},0 Q0,8 ${rx * 0.5},0`} fill="none" stroke={tone} strokeWidth="1.5" opacity="0.5" />
      </>
    );
  }
  if (form === 'sac') return <ellipse cx="0" cy="4" rx={rx * 0.35} ry={rx * 0.3} fill={tone} opacity="0.65" />;
  if (form !== 'plate') return null;
  return (
    <>
      <ellipse cx="0" cy="-4" rx={rx * 0.6} ry={rx * 0.5} fill={tone} opacity="0.4" />
      <path d={`M${-rx * 0.4},-8 L0,-12 L${rx * 0.4},-8`} fill="none" stroke={tone} strokeWidth="1.5" opacity="0.6" />
    </>
  );
}

export function TorsoOverlay({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.TORSO);
  if (!part) return null;
  const rx = plan.torsoWidth;
  return (
    <g>
      <ellipse cx="0" cy="0" rx={rx} ry={rx * 0.92} fill={toneOf(part.stone.rarity)} opacity={toneOpacityOf(part.stone.rarity) * 0.5} />
      <TorsoForm form={part.form} rx={rx} tone={toneOf(part.stone.rarity)} />
    </g>
  );
}

function WhipArms({ w, len, tone }) {
  return (
    <>
      <path d={`M${-w * 0.7},-2 C${-w - len * 0.8},8 ${-w - len * 1.1},18 ${-w - len * 1.3},22`} fill="none" stroke={tone} strokeWidth="3" opacity="0.7" />
      <path d={`M${w * 0.7},-2 C${w + len * 0.8},8 ${w + len * 1.1},18 ${w + len * 1.3},22`} fill="none" stroke={tone} strokeWidth="3" opacity="0.7" />
    </>
  );
}

function FistArms({ w, len, tone }) {
  return (
    <>
      <circle cx={-w - len * 1.2} cy="18" r="8" fill={tone} opacity="0.75" />
      <circle cx={w + len * 1.2} cy="18" r="8" fill={tone} opacity="0.75" />
    </>
  );
}

function TendrilArms({ w, len, tone }) {
  return (
    <>
      <path d={`M${-w * 0.7},-4 Q${-w - len * 0.5},6 ${-w - len * 0.8},14`} fill="none" stroke={tone} strokeWidth="2" opacity="0.6" />
      <path d={`M${w * 0.7},-4 Q${w + len * 0.5},6 ${w + len * 0.8},14`} fill="none" stroke={tone} strokeWidth="2" opacity="0.6" />
    </>
  );
}

function ClawArms({ w, len, tone }) {
  const tips = (side) => `${side * (w + len * 1.2)},16 L${side * (w + len * 1.4)},12 M${side * (w + len * 1.2)},16 L${side * (w + len * 1.1)},11 M${side * (w + len * 1.2)},16 L${side * (w + len * 1.3)},11`;
  return (
    <>
      <path d={tips(-1)} stroke={tone} strokeWidth="2" opacity="0.8" fill="none" />
      <path d={tips(1)} stroke={tone} strokeWidth="2" opacity="0.8" fill="none" />
    </>
  );
}

function FanArms({ w, len, tone, rng }) {
  return (
    <>
      <ellipse cx={-w - len * 1.2} cy="18" rx="10" ry="6" fill={tone} opacity="0.5" transform={`rotate(${-20 + rng() * 10} ${-w - len * 1.2} 18)`} />
      <ellipse cx={w + len * 1.2} cy="18" rx="10" ry="6" fill={tone} opacity="0.5" transform={`rotate(${20 - rng() * 10} ${w + len * 1.2} 18)`} />
    </>
  );
}

const ARM_FORMS = Object.freeze({ whip: WhipArms, fist: FistArms, tendril: TendrilArms, claw: ClawArms, fan: FanArms });

export function ArmsOverlay({ stones, plan, rng }) {
  const part = partFor(stones, STONE_SLOT.ARMS);
  if (!part) return null;
  const Shape = ARM_FORMS[part.form];
  if (!Shape) return null;
  return (
    <g>
      <Shape w={plan.torsoWidth} len={plan.arms * 2.2} tone={toneOf(part.stone.rarity)} rng={rng} />
    </g>
  );
}

function StiltLegs({ w, tone }) {
  return (
    <>
      <rect x={-w * 0.5 - 2} y="10" width="4" height="12" rx="2" fill={tone} opacity="0.7" />
      <rect x={w * 0.5 - 2} y="10" width="4" height="12" rx="2" fill={tone} opacity="0.7" />
    </>
  );
}

function RootLegs({ w, tone }) {
  return (
    <>
      <ellipse cx={-w * 0.6} cy="22" rx={w * 0.5} ry={w * 0.2} fill={tone} opacity="0.5" />
      <ellipse cx={w * 0.6} cy="22" rx={w * 0.5} ry={w * 0.2} fill={tone} opacity="0.5" />
    </>
  );
}

function TalonLegs({ w, tone }) {
  return (
    <>
      <path d={`M${-w * 0.5},14 L${-w * 0.6},20 L${-w * 0.4},20 Z`} fill={tone} opacity="0.7" />
      <path d={`M${w * 0.5},14 L${w * 0.4},20 L${w * 0.6},20 Z`} fill={tone} opacity="0.7" />
    </>
  );
}

function ColumnLegs({ w, tone }) {
  return (
    <>
      <ellipse cx={-w * 0.5} cy="18" rx={w * 0.4} ry={w * 0.3} fill={tone} opacity="0.6" />
      <ellipse cx={w * 0.5} cy="18" rx={w * 0.4} ry={w * 0.3} fill={tone} opacity="0.6" />
    </>
  );
}

function SnailfootLegs({ w, tone }) {
  const foot = (side) => (
    <>
      <ellipse cx={side * w * 0.6} cy="22" rx={w * 0.75} ry={w * 0.3} fill={tone} opacity="0.5" />
      <path d={`M${side * w * 1.15},22 q${-side * w * 0.55},-${w * 0.45} ${-side * w * 0.55},0`} fill="none" stroke={tone} strokeWidth="1.3" opacity="0.75" />
    </>
  );
  return <g>{foot(-1)}{foot(1)}</g>;
}

const LEG_FORMS = Object.freeze({ snailfoot: SnailfootLegs, stilt: StiltLegs, root: RootLegs, talon: TalonLegs, column: ColumnLegs });

export function LegsOverlay({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.LEGS);
  if (!part) return null;
  const Shape = LEG_FORMS[part.form];
  if (!Shape) return null;
  return (
    <g>
      <Shape w={plan.legs * 1.6} tone={toneOf(part.stone.rarity)} />
    </g>
  );
}

export function AuraLayer({ stones, auraId }) {
  const epic = stones.filter((entry) => entry.rarity === STONE_RARITY.EPIC || entry.rarity === STONE_RARITY.LEGENDARY);
  if (epic.length === 0) return null;
  const power = epic.reduce((sum, entry) => sum + STONE_DEFS[entry.rarity].power, 0);
  const radius = AURA.base + power * AURA.perPower;
  return (
    <g>
      <circle cx="0" cy="0" r={radius} fill={`url(#${auraId})`} opacity={Math.min(AURA.maxOpacity, power * 0.1)} />
      <circle cx="0" cy="0" r={radius} fill="none" stroke={toneOf(epic[epic.length - 1].rarity)} strokeWidth="0.8" opacity="0.3" strokeDasharray="4 3" />
    </g>
  );
}
