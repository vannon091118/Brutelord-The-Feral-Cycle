import { memo, useMemo } from 'react';
import { creatureClasses, dunglingAnimation } from './dungling/dungling-anim.js';
import { DunglingFeet } from './dungling/DunglingFeet.jsx';
import { DunglingBody } from './dungling/DunglingBody.jsx';
import { DunglingFace } from './dungling/DunglingFace.jsx';
import { DunglingTool } from './dungling/DunglingTool.jsx';
import { lookOf } from './dungling/dungling-look.js';

// @doc: docs/daten/world/dungling.svg.md#dungling-svg
export const DunglingSvg = memo(function DunglingSvg({ dungling, tileSize, x, y, step = 0 }) {
  const unit = tileSize / 64;
  const facing = dungling.facing >= 0 ? 1 : -1;
  const view = dunglingAnimation(dungling.state);
  const look = useMemo(() => lookOf(dungling.id), [dungling.id]);

  return (
    <g style={{ pointerEvents: 'none' }} transform={`translate(${x} ${y}) scale(${unit * facing} ${unit})`}>
      <g className={creatureClasses({ mood: view.mood })}>
        <g className={view.bodyAnimation}>
          <DunglingFeet step={step} look={look} />
          <g className="dl-anim dl-dungle-breathe dl-creature-breathe">
            <DunglingBody look={look} />
            <DunglingFace working={view.working} look={look} />
            <DunglingTool working={view.working} moving={view.moving} />
          </g>
        </g>
      </g>
    </g>
  );
});
