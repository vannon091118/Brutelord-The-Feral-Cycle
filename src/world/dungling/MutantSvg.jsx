// @doc: docs/daten/dungling/mutantsvg.md#mutantsvg
import { memo } from 'react';
import { DUNGLING_STATE } from '../../domain/entities/dungling.js';
import { investedIn } from '../../domain/brutelord/mutant.js';
import { DunglingSvg } from '../Dungling.svg.jsx';
import { makeRng } from '../tile-shapes.js';
import { bodyPlan } from './mutant-plan.js';
import { ArmsOverlay, AuraLayer, HeadOverlay, LegsOverlay, TorsoOverlay } from './mutant-overlays.jsx';

const VIEW_BOX = '-60 -60 120 110';
const BASE_SIZE = 120;
const BASE_SEED = 0x7a2b;

function baseDungling(stones) {
  return {
    id: 'mutant-base',
    tile: { x: 0, y: 0 },
    facing: 1,
    state: DUNGLING_STATE.IDLE,
    targetTileId: null,
    job: null,
    stones,
    invested: investedIn(stones),
    battleEp: 0,
  };
}

export const MutantSvg = memo(function MutantSvg({ stones = [], size = null, step = 0, id = 'lab' }) {
  const plan = bodyPlan(stones);
  const rng = makeRng(BASE_SEED + stones.reduce((sum, stone) => sum + stone.seed, 0));
  const box = size ? { width: size, height: size, x: -size / 2, y: -size / 2 } : {};
  const auraId = `dl-mutant-aura-${id}`;

  return (
    <svg viewBox={VIEW_BOX} className={size ? undefined : 'h-full w-full'} {...box} aria-label="Mutierter Dungling">
      <defs>
        <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(176,108,255,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <DunglingSvg dungling={baseDungling(stones)} tileSize={BASE_SIZE} x={0} y={10} step={step} />
      <HeadOverlay stones={stones} plan={plan} />
      <TorsoOverlay stones={stones} plan={plan} />
      <ArmsOverlay stones={stones} plan={plan} rng={rng} />
      <LegsOverlay stones={stones} plan={plan} />
      <AuraLayer stones={stones} auraId={auraId} />
    </svg>
  );
});
