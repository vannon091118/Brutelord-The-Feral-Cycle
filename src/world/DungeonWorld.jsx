import { useMemo } from 'react';

import { ACTION_TYPES } from '../domain/actions/action-types.js';
import { HIVE_CENTER_PX } from '../domain/entities/hive.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { STAGE } from '../domain/onboarding/onboarding-state.js';
import { TILE_KIND } from '../domain/world/tile.js';
import { VIEWBOX, WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from '../domain/world/world-config.js';
import { createRng } from '../domain/world/random.js';

import DunglingSvg from './Dungling.svg.jsx';
import EarthTile from './EarthTile.jsx';
import FloorTile from './FloorTile.jsx';
import HiveSvg from './Hive.svg.jsx';
import MiningParticles from './MiningParticles.jsx';
import { round } from './hand.js';

const cfg = ONBOARDING_CONFIG;

/** Loose pebbles and roots outside the playfield, so the world does not end abruptly. */
const SCATTER = (() => {
  const rng = createRng('world:scatter');
  const items = [];
  for (let i = 0; i < 26; i += 1) {
    const onTop = rng() > 0.5;
    items.push({
      x: round(-40 + rng() * (WORLD_WIDTH + 80)),
      y: onTop ? round(-38 + rng() * 30) : round(WORLD_HEIGHT + 8 + rng() * 30),
      r: round(2 + rng() * 7),
      o: round(0.1 + rng() * 0.22),
      tone: rng() > 0.5 ? '#3a2a18' : '#241a0f',
    });
  }
  return items;
})();

const MOTES = (() => {
  const rng = createRng('world:motes');
  const items = [];
  for (let i = 0; i < 16; i += 1) {
    items.push({
      x: round(rng() * WORLD_WIDTH),
      y: round(rng() * WORLD_HEIGHT),
      dx: round((rng() - 0.5) * 22),
      dy: round(-10 - rng() * 18),
      r: round(0.5 + rng() * 0.9),
      life: round(5200 + rng() * 5200),
      delay: round(-rng() * 8000),
    });
  }
  return items;
})();

const COLLAPSE_PUFF = (() => {
  const rng = createRng('collapse:puff');
  const items = [];
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2 + rng() * 0.4;
    const distance = 12 + rng() * 20;
    items.push({
      dx: round(Math.cos(angle) * distance),
      dy: round(Math.sin(angle) * distance * 0.7),
      r: round(1.4 + rng() * 2.6),
      tone: ['#8a6039', '#6b4a2c', '#33210f', '#9a7247'][Math.floor(rng() * 4)],
      delay: round(rng() * 160),
    });
  }
  return items;
})();

function Backdrop() {
  return (
    <g>
      <defs>
        <radialGradient id="dl-world-light" cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="#4a3418" />
          <stop offset="42%" stopColor="#2a1e11" />
          <stop offset="100%" stopColor="#120d08" />
        </radialGradient>
        <radialGradient id="dl-vignette" cx="50%" cy="50%" r="52%">
          <stop offset="55%" stopColor="#0b0805" stopOpacity="0" />
          <stop offset="100%" stopColor="#070503" stopOpacity="0.92" />
        </radialGradient>
      </defs>

      <rect
        x={VIEWBOX.x}
        y={VIEWBOX.y}
        width={VIEWBOX.width}
        height={VIEWBOX.height}
        fill="url(#dl-world-light)"
      />

      {SCATTER.map((s, i) => (
        <circle key={`scatter-${i}`} cx={s.x} cy={s.y} r={s.r} fill={s.tone} opacity={s.o} />
      ))}

      {/* packed earth under the hive so it sits in the ground, not on a plate */}
      <ellipse
        cx={HIVE_CENTER_PX.x}
        cy={HIVE_CENTER_PX.y + 26}
        rx={126}
        ry={92}
        fill="#3b2a15"
        opacity={0.35}
      />
      <ellipse
        cx={HIVE_CENTER_PX.x}
        cy={HIVE_CENTER_PX.y + 26}
        rx={96}
        ry={66}
        fill="#4a3519"
        opacity={0.22}
      />

      {MOTES.map((m, i) => (
        <circle
          key={`mote-${i}`}
          cx={m.x}
          cy={m.y}
          r={m.r}
          fill="#d9b076"
          className="dl-reduce-motion"
          style={{
            '--dx': `${m.dx}px`,
            '--dy': `${m.dy}px`,
            animation: `dl-dust ${m.life}ms linear ${m.delay}ms infinite`,
          }}
        />
      ))}

      <rect
        x={VIEWBOX.x}
        y={VIEWBOX.y}
        width={VIEWBOX.width}
        height={VIEWBOX.height}
        fill="url(#dl-vignette)"
        pointerEvents="none"
      />
    </g>
  );
}

/**
 * The playfield. Everything here is a rendering of domain state:
 * the component never decides what happens, it only shows what happened.
 */
export default function DungeonWorld({ state, dispatch }) {
  const { grid, stage, dungling, targetTileId, actionableTileIds, miningTileId, destroyedTileId, buildTileId } =
    state;

  const tiles = useMemo(
    () =>
      Object.values(grid.tiles).sort((a, b) => a.y - b.y || a.x - b.x),
    [grid.tiles],
  );

  const hiveInteractive = stage === STAGE.INITIAL;
  const miningTile = miningTileId ? grid.tiles[miningTileId] : null;
  const dunglingActivity =
    stage === STAGE.MOVING_TO_TILE ? 'move' : stage === STAGE.MINING ? 'work' : 'idle';

  return (
    <svg
      className="dl-world-surface block h-full w-full"
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="application"
      aria-label="Dungeon Lord Spielfeld"
    >
      <Backdrop />

      {tiles.map((tile) => {
        if (tile.kind === TILE_KIND.HIVE) return null;
        if (tile.kind === TILE_KIND.FLOOR) {
          return (
            <FloorTile
              key={tile.id}
              tile={tile}
              isBuildTile={tile.id === buildTileId}
              justRevealed={tile.id === buildTileId && stage === STAGE.GRID_EXPANDED}
            />
          );
        }
        return (
          <EarthTile
            key={tile.id}
            tile={tile}
            isTarget={tile.id === targetTileId}
            isActionable={actionableTileIds.includes(tile.id)}
            onSelect={(tileId) => dispatch({ type: ACTION_TYPES.TILE_SELECTED, tileId })}
          />
        );
      })}

      <HiveSvg
        isMutating={stage === STAGE.MUTATING}
        isInteractive={hiveInteractive}
        onSelect={() => dispatch({ type: ACTION_TYPES.HIVE_CLICKED })}
      />

      {stage === STAGE.TILE_DESTROYED && destroyedTileId ? (
        <g
          transform={`translate(${(grid.tiles[destroyedTileId].x + 0.5) * TILE_SIZE} ${(grid.tiles[destroyedTileId].y + 0.5) * TILE_SIZE})`}
          pointerEvents="none"
        >
          {COLLAPSE_PUFF.map((p, i) => (
            <circle
              key={`puff-${i}`}
              r={p.r}
              fill={p.tone}
              className="dl-reduce-motion"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                animation: `dl-particle ${cfg.tileDestroyedPauseMs}ms ease-out ${p.delay}ms forwards`,
              }}
            />
          ))}
        </g>
      ) : null}

      {stage === STAGE.MINING && dungling && miningTile ? (
        <MiningParticles tile={miningTile} workerPosition={dungling.position} />
      ) : null}

      {dungling ? (
        <DunglingSvg position={dungling.position} activity={dunglingActivity} facing={dungling.facing} />
      ) : null}
    </svg>
  );
}