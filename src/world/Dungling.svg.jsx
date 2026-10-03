import { memo, useMemo } from 'react';
import { dunglingAnimation } from './dungling/dungling-anim.js';
import { DunglingFeet } from './dungling/DunglingFeet.jsx';
import { DunglingBody } from './dungling/DunglingBody.jsx';
import { DunglingFace } from './dungling/DunglingFace.jsx';
import { DunglingTool } from './dungling/DunglingTool.jsx';
import { makeRng } from './tile-shapes.js';

/**
 * Der Dungling: ein kleines Geschwur, das der Hive treibt. Weich, lappig und
 * fleischig — es arbeitet mit Wurzeln, nicht mit Werkzeug. Gezeichnet in einem
 * Nominalsystem um (0,0), das auf die Tile-Größe skaliert wird.
 */
function budLobes(dungling) {
  const rng = makeRng(0x2f19 + dungling.tile.x * 31 + dungling.tile.y * 17);
  return Array.from({ length: 4 }, (_, index) => ({
    cx: -7 + index * 4.8 + (rng() - 0.5) * 2.4,
    cy: -13 + rng() * 5,
    r: 2.6 + rng() * 1.8,
    opacity: 0.4 + rng() * 0.3,
  }));
}

export const DunglingSvg = memo(function DunglingSvg({ dungling, tileSize, x, y, step = 0 }) {
  const unit = tileSize / 64;
  const facing = dungling.facing >= 0 ? 1 : -1;
  const view = dunglingAnimation(dungling.state);
  const lobes = useMemo(() => budLobes(dungling), [dungling.tile.x, dungling.tile.y]);

  return (
    <g transform={`translate(${x} ${y}) scale(${unit * facing} ${unit})`}>
      <g className={view.bodyAnimation}>
        <DunglingFeet step={step} />
        <g className="dl-anim dl-dungle-breathe">
          <DunglingBody lobes={lobes} />
          <DunglingFace working={view.working} />
          <DunglingTool working={view.working} moving={view.moving} />
        </g>
      </g>
    </g>
  );
});