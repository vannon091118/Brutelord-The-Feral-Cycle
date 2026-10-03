/**
 * Der mutierte Dungling auf dem Arbeitstisch: die Steine blähen einzelne Stellen
 * auf, der Gegenpol hält den Körper lesbar. Reine Darstellung der Geometrie.
 */
import { STONE_DEFS, STONE_SLOT } from '../../domain/brutelord/stone-config.js';
import { bodyPlan, partFor } from './mutant-plan.js';

const TONE = Object.freeze({ grau: '#9aa0a6', blau: '#5aa9ff', lila: '#b06cff', gold: '#ffcf5a' });

function toneOf(rarity) {
  return TONE[STONE_DEFS[rarity].tone];
}

function Head({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.HEAD);
  const r = plan.head;
  return (
    <g>
      <ellipse cx="0" cy={-18 - r * 0.2} rx={r * 0.9} ry={r * 0.8} fill={part ? toneOf(part.stone.rarity) : 'var(--color-hive-600)'} />
      {part && part.form === 'horn' ? <path d="M-3,-30 L0,-40 L3,-30 Z" fill={toneOf(part.stone.rarity)} /> : null}
      {part && part.form === 'crown' ? <path d="M-8,-32 L0,-44 L8,-32 Z" fill={toneOf(part.stone.rarity)} opacity="0.9" /> : null}
      {part && part.form === 'antenna' ? <path d="M0,-30 L2,-42" stroke={toneOf(part.stone.rarity)} strokeWidth="2" fill="none" /> : null}
    </g>
  );
}

function Torso({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.TORSO);
  const rx = plan.torsoWidth;
  return (
    <g>
      <ellipse cx="0" cy="0" rx={rx} ry={rx * 0.92} fill={part ? toneOf(part.stone.rarity) : 'var(--color-hive-700)'} opacity="0.92" />
      {part && part.form === 'hump' ? <ellipse cx="0" cy="-12" rx={rx * 0.5} ry="7" fill={toneOf(part.stone.rarity)} /> : null}
    </g>
  );
}

function Arms({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.ARMS);
  const len = plan.arms * 2.2;
  const tone = part ? toneOf(part.stone.rarity) : 'var(--color-hive-600)';
  return (
    <g stroke={tone} strokeWidth={part ? 6 : 4} strokeLinecap="round" fill="none">
      <path d={`M${-plan.torsoWidth * 0.7},-4 C${-plan.torsoWidth - len * 0.6},2 ${-plan.torsoWidth - len},10 ${-plan.torsoWidth - len * 1.2},16`} />
      <path d={`M${plan.torsoWidth * 0.7},-4 C${plan.torsoWidth + len * 0.6},2 ${plan.torsoWidth + len},10 ${plan.torsoWidth + len * 1.2},16`} />
      {part && part.form === 'fist' ? (
        <>
          <circle cx={-plan.torsoWidth - len * 1.2} cy="18" r="7" fill={tone} stroke="none" />
          <circle cx={plan.torsoWidth + len * 1.2} cy="18" r="7" fill={tone} stroke="none" />
        </>
      ) : null}
    </g>
  );
}

function Legs({ stones, plan }) {
  const part = partFor(stones, STONE_SLOT.LEGS);
  const w = plan.legs * 1.6;
  const tone = part ? toneOf(part.stone.rarity) : 'var(--color-hive-800)';
  return (
    <g fill={tone}>
      <ellipse cx={-w * 0.5} cy="16" rx={w} ry={w * 0.5} />
      <ellipse cx={w * 0.5} cy="16" rx={w} ry={w * 0.5} />
      {part && part.form === 'snailfoot' ? <ellipse cx="0" cy="20" rx={w * 1.8} ry={w * 0.7} fill={tone} opacity="0.8" /> : null}
    </g>
  );
}

export function MutantSvg({ stones = [] }) {
  const plan = bodyPlan(stones);
  return (
    <svg viewBox="-60 -60 120 110" className="h-full w-full" aria-label="Mutierter Dungling">
      <Legs stones={stones} plan={plan} />
      <Arms stones={stones} plan={plan} />
      <Torso stones={stones} plan={plan} />
      <Head stones={stones} plan={plan} />
    </svg>
  );
}