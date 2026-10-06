import { memo, useMemo } from 'react';
import { DunglingSvg } from './Dungling.svg.jsx';
import { MutantSvg } from './dungling/MutantSvg.jsx';
import { MiningParticles } from './MiningParticles.jsx';
import { CarriedEssence, EssencePopup } from './essence/EssencePopup.jsx';
import { genomeOf, isMutant } from '../domain/brutelord/mutant.js';

function WorkerBody({ worker, tileSize }) {
  const { dungling, position, step } = worker;
  const genome = useMemo(() => (isMutant(dungling) ? genomeOf(dungling) : null), [dungling]);
  if (!isMutant(dungling)) {
    return <DunglingSvg dungling={dungling} tileSize={tileSize} x={position.x} y={position.y} step={step} />;
  }
  const facing = dungling.facing >= 0 ? 1 : -1;
  return (
    <g transform={`translate(${position.x} ${position.y}) scale(${facing} 1)`}>
      <MutantSvg genome={genome} size={tileSize * 0.9} id={worker.id} />
    </g>
  );
}

// @doc: docs/daten/world/workerlayer.md#workerlayer
export const WorkerLayer = memo(function WorkerLayer({ workers, popups, tileSize }) {
  return (
    <>
      {workers.map((worker) => (
        <g key={worker.id}>
          <WorkerBody worker={worker} tileSize={tileSize} />
          <MiningParticles origin={worker.position} tick={worker.step} active={worker.mining} />
          {worker.dungling.job?.carrying ? (
            <CarriedEssence position={worker.position} tileSize={tileSize} />
          ) : null}
        </g>
      ))}
      {popups.map((popup) => (
        <EssencePopup key={popup.id} at={popup.position} />
      ))}
    </>
  );
});
