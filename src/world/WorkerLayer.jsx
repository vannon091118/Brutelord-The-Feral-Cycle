import { memo } from 'react';
import { DunglingSvg } from './Dungling.svg.jsx';
import { MutantSvg } from './dungling/MutantSvg.jsx';
import { MiningParticles } from './MiningParticles.jsx';
import { CarriedEssence, EssencePopup } from './essence/EssencePopup.jsx';
import { isMutant } from '../domain/brutelord/mutant.js';

function WorkerBody({ worker, tileSize }) {
  const { dungling, position, step } = worker;
  if (!isMutant(dungling)) {
    return <DunglingSvg dungling={dungling} tileSize={tileSize} x={position.x} y={position.y} step={step} />;
  }
  const facing = dungling.facing >= 0 ? 1 : -1;
  return (
    <g transform={`translate(${position.x} ${position.y}) scale(${facing} 1)`}>
      <MutantSvg stones={dungling.stones} size={tileSize * 0.9} id={worker.id} />
    </g>
  );
}

/**
 * Alles, was über der Welt lebt: der Schwarm bei der Arbeit und die
 * Essenzsymbole, die kurz über dem Abladeort aufsteigen. Beides hängt an
 * Positionen aus dem Auftrag — deshalb eine Ebene.
 */
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
