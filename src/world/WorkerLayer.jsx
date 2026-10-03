import { memo } from 'react';
import { DunglingSvg } from './Dungling.svg.jsx';
import { MiningParticles } from './MiningParticles.jsx';
import { CarriedEssence, EssencePopup } from './essence/EssencePopup.jsx';

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
          <DunglingSvg
            dungling={worker.dungling}
            tileSize={tileSize}
            x={worker.position.x}
            y={worker.position.y}
            step={worker.step}
          />
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
