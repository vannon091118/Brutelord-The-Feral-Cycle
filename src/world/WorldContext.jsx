import { scatterRocks } from './tile-shapes.js';
import { WorldDefs } from './WorldDefs.jsx';

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

/** Unerforschte Masse: dunkel, körnig, ohne Kanten. */
function UnchartedRock({ camera }) {
  return (
    <>
      <rect x={camera.x} y={camera.y} width={camera.width} height={camera.height} fill="var(--color-soil-950)" />
      <rect x={camera.x} y={camera.y} width={camera.width} height={camera.height} fill="url(#dl-grit)" opacity="0.45" />
      <RockField rocks={scatterRocks({ seed: 0x51a3b7, minX: camera.x + 8, minY: camera.y + 8, maxX: camera.x + camera.width - 8, maxY: camera.y + camera.height - 8, count: 34 })} />
    </>
  );
}

function BackgroundHitArea({ camera, onClick }) {
  return (
    <rect
      x={camera.x}
      y={camera.y}
      width={camera.width}
      height={camera.height}
      fill="transparent"
      onClick={onClick}
    />
  );
}

/** Die unbearbeitete Erde, Kulisse und Auswahl-Hintergrund. */
export function WorldContext({ view, onBackgroundClick }) {
  return (
    <>
      <WorldDefs camera={view.camera} />
      <UnchartedRock camera={view.camera} />
      <BackgroundHitArea camera={view.camera} onClick={onBackgroundClick} />
    </>
  );
}

/** Der Rand des Bildes: die Höhle verliert sich, das Sichtfeld ist begrenzt. */
export function WorldVignette({ camera }) {
  return (
    <rect
      x={camera.x}
      y={camera.y}
      width={camera.width}
      height={camera.height}
      fill="url(#dl-vignette)"
      style={{ pointerEvents: 'none' }}
    />
  );
}