// @doc: docs/daten/deposits/depositlayer.md#depositlayer
import { DepositGlow } from './DepositGlow.jsx';
import { DepositHint } from './DepositHint.jsx';
import { DepositParticles } from './DepositParticles.jsx';

export function DepositLayer({ view, tileSize }) {
  return (
    <>
      <DepositGlow view={view} size={tileSize} />
      <DepositHint view={view} size={tileSize} />
      <DepositParticles view={view} size={tileSize} />
    </>
  );
}
