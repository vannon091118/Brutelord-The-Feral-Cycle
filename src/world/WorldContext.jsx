import { useMemo } from 'react';
import { scatterRocks } from './tile-shapes.js';

function RockField({ rocks }) {
  return rocks.map((rock) => (
    <ellipse
      key={`rock-${rock.cx}-${rock.cy}`}
      cx={rock.cx}
      cy={rock.cy}
      rx={rock.r}
      ry={rock.r * rock.sq}
      fill={rock.tone === 'light' ? 'var(--color-soil-400)' : 'var(--color-soil-950)'}
      opacity={rock.opacity}
      transform={`rotate(${rock.rot} ${rock.cx} ${rock.cy})`}
    />
  ));
}

function GridFrame({ width, height }) {
  return (
    <rect
      x="-3"
      y="-3"
      width={width + 6}
      height={height + 6}
      rx="16"
      fill="none"
      stroke="var(--color-soil-950)"
      strokeWidth="10"
      opacity="0.4"
    />
  );
}

function BackgroundHitArea({ bleed, width, height, onClick }) {
  return (
    <rect
      x={-bleed}
      y={-bleed}
      width={width}
      height={height}
      fill="transparent"
      onClick={onClick}
    />
  );
}

/** Die unbearbeitete Erde, Kulisse und Auswahl-Hintergrund. */
export function WorldContext({ view, onBackgroundClick }) {
  const { bleed, width, height } = view.size;
  const rocks = useMemo(() => makeWorldRocks(view), [view]);

  return (
    <>
      <rect x={-bleed} y={-bleed} width={width} height={height} fill="url(#dl-rawSoil)" />
      <rect x={-bleed} y={-bleed} width={width} height={height} fill="url(#dl-grit)" opacity="0.5" />
      <RockField rocks={rocks} />
      <GridFrame width={view.gridWidth} height={view.gridHeight} />
      <BackgroundHitArea bleed={bleed} width={width} height={height} onClick={onBackgroundClick} />
    </>
  );
}

function makeWorldRocks(view) {
  const { bleed } = view.size;
  return scatterRocks({
    seed: 0x51a3b7,
    minX: -bleed + 5,
    minY: -bleed + 5,
    maxX: view.gridWidth + bleed - 5,
    maxY: view.gridHeight + bleed - 5,
    count: 26,
  });
}
