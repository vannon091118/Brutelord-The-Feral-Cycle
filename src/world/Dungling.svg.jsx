import { memo } from 'react';
import { dunglingAnimation } from './dungling/dungling-anim.js';
import { DunglingFeet } from './dungling/DunglingFeet.jsx';
import { DunglingBody } from './dungling/DunglingBody.jsx';
import { DunglingFace } from './dungling/DunglingFace.jsx';
import { DunglingTool } from './dungling/DunglingTool.jsx';

/**
 * Der Dungling: klein, rundlich, handgemacht, freundlich — mit ein paar
 * fremdartigen Details. Gezeichnet in einem Nominalsystem um (0,0), das auf
 * die Tile-Größe skaliert wird.
 */
export const DunglingSvg = memo(function DunglingSvg({ dungling, tileSize, x, y }) {
  const unit = tileSize / 64;
  const facing = dungling.facing >= 0 ? 1 : -1;
  const view = dunglingAnimation(dungling.state);

  return (
    <g transform={`translate(${x} ${y}) scale(${unit * facing} ${unit})`}>
      <g className={view.bodyAnimation}>
        <DunglingFeet />
        <g className="dl-anim dl-dungle-breathe">
          <DunglingBody />
          <DunglingFace working={view.working} />
          <DunglingTool working={view.working} moving={view.moving} />
        </g>
      </g>
    </g>
  );
});
