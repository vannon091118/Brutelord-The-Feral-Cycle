// @doc: docs/daten/dungling/mutantsvg.md#mutantsvg
import { memo } from 'react';
import { organicFrame } from '../../domain/brutelord/organic-cache.js';
import { useOrganicPhase } from './organic-phase-clock.js';
import { OrganicBody, SKIN_TONE, SkinDefs } from './organic-skin.jsx';
import { Features } from './organic-features.jsx';

const VIEW_BOX = '-70 -80 140 160';

export const MutantSvg = memo(function MutantSvg({ genome = null, size = null, id = 'lab' }) {
  const phase = useOrganicPhase();
  const frame = genome ? organicFrame(genome, phase) : null;
  const tone = frame ? SKIN_TONE[frame.phenotype.skin] : null;
  const box = size ? { width: size, height: size, x: -size / 2, y: -size / 2 } : { className: 'h-full w-full' };
  const mark = frame
    ? { 'data-genome': frame.phenotype.hash.toString(36), 'data-phase': frame.phase }
    : { 'data-phase': -1 };
  return (
    <svg viewBox={VIEW_BOX} {...box} data-unit={id} {...mark} aria-label="Mutierter Dungling">
      {frame ? <SkinDefs id={id} skin={frame.phenotype.skin} /> : null}
      <OrganicBody frame={frame} tone={tone} id={id} phase={phase} />
      {frame ? <Features anchors={frame.anchors} view={frame.view} tone={tone} species={frame.phenotype.species} /> : null}
    </svg>
  );
});
