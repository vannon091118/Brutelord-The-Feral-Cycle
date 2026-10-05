// @doc: docs/daten/deposits/depositparticles.md#depositparticles
import { DEPOSIT_PHASE } from '../../domain/deposits/deposit-config.js';
import { ashBurst, depositShards, harvestBurst } from './deposit-visuals.js';

const SHARD_SHAPE = 'M0 -2.4 L1.7 0 L0 2.4 L-1.7 0 Z';

function centerOf(tile, size) {
  return { x: tile.x * size + size / 2, y: tile.y * size + size / 2 };
}

function Shard({ shard, center }) {
  return (
    <g transform={`translate(${center.x + shard.x} ${center.y + shard.y})`}>
      <path
        className="dl-anim dl-essence-shard"
        d={SHARD_SHAPE}
        fill={shard.fill}
        style={{
          '--dl-dx': `${shard.dx}px`,
          '--dl-dy': `${shard.dy}px`,
          '--dl-delay': `${shard.delay}s`,
          '--dl-dur': `${shard.dur}s`,
          '--dl-scale': shard.scale,
        }}
      />
    </g>
  );
}

function ShardField({ tile, size }) {
  const center = centerOf(tile, size);
  return depositShards(tile, tile.deposit).map((shard) => (
    <Shard key={shard.key} shard={shard} center={center} />
  ));
}

function BurstShard({ part, center }) {
  return (
    <circle
      className="dl-anim dl-essence-burst"
      cx={center.x + part.x}
      cy={center.y + part.y}
      r={part.r}
      fill={part.fill}
      style={{ '--dl-sx': `${part.sx}px`, '--dl-sy': `${part.sy}px`, '--dl-life': `${part.life}ms` }}
    />
  );
}

function HarvestField({ tile, harvest, size }) {
  const center = centerOf(tile, size);
  const parts = harvestBurst({ tile, seq: harvest.seq, size, to: harvest.to });
  return parts.map((part) => <BurstShard key={part.key} part={part} center={center} />);
}

function AshPiece({ piece, center }) {
  return (
    <circle
      className="dl-anim dl-essence-ash"
      cx={center.x + piece.x}
      cy={center.y + piece.y}
      r={piece.r}
      fill={piece.fill}
      style={{
        '--dl-dx': `${piece.dx}px`,
        '--dl-dy': `${piece.dy}px`,
        '--dl-fall': `${piece.fall}px`,
        '--dl-life': `${piece.life}ms`,
      }}
    />
  );
}

function AshField({ tile, seq, size }) {
  const center = centerOf(tile, size);
  return ashBurst(tile, seq).map((piece) => (
    <AshPiece key={piece.key} piece={piece} center={center} />
  ));
}

function tileOf(view, id) {
  return view.tiles.find((tile) => tile.id === id) ?? null;
}

export function DepositParticles({ view, size }) {
  const open = view.tiles.filter(
    (tile) => tile.deposit?.phase === DEPOSIT_PHASE.FOUND || tile.deposit?.phase === DEPOSIT_PHASE.SPENT,
  );
  const harvest = view.lastHarvest;
  const struck = harvest && view.workingTileId === harvest.tileId ? tileOf(view, harvest.tileId) : null;
  const dying = harvest?.depleted ? tileOf(view, harvest.tileId) : null;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {open.map((tile) => (
        <ShardField key={tile.id} tile={tile} size={size} />
      ))}
      {struck ? <HarvestField tile={struck} harvest={harvest} size={size} /> : null}
      {dying ? <AshField tile={dying} seq={harvest.seq} size={size} /> : null}
    </g>
  );
}
