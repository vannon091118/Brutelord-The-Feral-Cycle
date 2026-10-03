import { memo } from 'react';
import { DunglingSvg } from './Dungling.svg.jsx';
import { MiningParticles } from './MiningParticles.jsx';

/**
 * Der Arbeiter: der Dungling und die Krümel, die er aus dem Boden löst.
 * Beides hängt an seiner Position — deshalb eine Einheit.
 */
export const WorkerNode = memo(function WorkerNode({ dungling, position, tileSize, mining, working }) {
  if (!dungling || !position) return null;

  return (
    <>
      <DunglingSvg dungling={dungling} tileSize={tileSize} x={position.x} y={position.y} />
      <MiningParticles origin={position} tick={mining?.tick ?? 0} active={working} />
    </>
  );
});
