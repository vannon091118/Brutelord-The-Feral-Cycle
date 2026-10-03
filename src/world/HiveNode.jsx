import { memo } from 'react';
import { canMutate } from '../domain/entities/hive.js';
import { soilBlob } from './tile-shapes.js';
import { HiveSvg } from './Hive.svg.jsx';
import { HiveInvitation } from './hive/HiveInvitation.jsx';
import { HiveHitArea } from './hive/HiveHitArea.jsx';

/**
 * Der Hive als Ganzes: Mulde, Zeichnung, Einladung und Klickfläche. Er ist nur
 * klickbar, solange er noch nichts geboren hat. Unter ihm liegt kein Feld,
 * sondern gewachsene Erde — die Mulde, die er sich selbst gegraben hat.
 */
/** Die gewachsene Mulde, in der der Hive sitzt. */
function hiveNest({ hive, tileSize }) {
  return soilBlob({
    x: hive.origin.x * tileSize,
    y: hive.origin.y * tileSize,
    size: tileSize * hive.size.width,
    inset: 2,
    jitter: 2.4,
    outward: 9,
    points: 16,
    seed: 0x41ee,
  });
}

export const HiveNode = memo(function HiveNode({ hive, tileSize, onboardingState, onClick }) {
  const clickable = canMutate(hive);

  return (
    <>
      <path d={hiveNest({ hive, tileSize })} fill="url(#dl-earthMass)" />
      <HiveSvg
        hive={hive}
        tileSize={tileSize}
        onboardingState={onboardingState}
        spawned={hive.spawned}
      />
      {clickable ? <HiveInvitation hive={hive} tileSize={tileSize} /> : null}
      <HiveHitArea
        hive={hive}
        tileSize={tileSize}
        clickable={clickable}
        onClick={onClick}
      />
    </>
  );
});
