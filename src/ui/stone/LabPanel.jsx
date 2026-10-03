/** Das Labor des Brutlords: Inventar links, Arbeitstisch rechts, Kauf oben. */
import { useState } from 'react';
import { STONE_CONFIG } from '../../domain/brutelord/stone-config.js';
import { placedStones, stoneLabel, canAffordStone, labIsFull } from '../../domain/brutelord/lab-state.js';
import { LabBench } from './LabBench.jsx';
import { StoneChip } from './StoneChip.jsx';

const BUY_CLASS =
  'rounded-lg border border-core-400/40 bg-core-500/15 px-2.5 py-1 text-[11px] text-core-200 transition hover:bg-core-500/25 disabled:opacity-40';

function LabHeader({ onClose }) {
  return (
    <header className="flex items-start justify-between gap-2 pb-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold tracking-wide text-bone-100">Labor</h2>
        <span className="text-[10px] text-bone-400">Essenz-Steine für den Brutlord</span>
      </div>
      <button type="button" onClick={onClose} className="shrink-0 rounded-full border border-bone-400/20 px-2 py-[2px] text-[10px] text-bone-300">
        Schließen
      </button>
    </header>
  );
}

function LabInventory({ lab, onDragStart }) {
  if (lab.stones.length === 0) {
    return <p className="px-1 text-[11px] leading-snug text-bone-400">Noch kein Stein. Der Brutlord nimmt Essenz gegen Zufall.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {lab.stones.map((stone) => (
        <StoneChip key={stone.seed} stone={stone} label={stoneLabel(lab, stone)} onDragStart={onDragStart} />
      ))}
    </div>
  );
}

function LabTray({ lab, essence, full, onBuy }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-bone-400/10 bg-soil-900/60 px-3 py-2">
      <span className="text-[11px] text-bone-200">Essenz {essence}</span>
      <button type="button" className={BUY_CLASS} disabled={full || !canAffordStone(essence)} onClick={onBuy}>
        Stein kaufen · {STONE_CONFIG.cost}
      </button>
    </div>
  );
}

function LabFooter() {
  return (
    <p className="px-0.5 pt-2 text-[10px] leading-snug text-bone-400">
      Die Farbe verrät die Seltenheit. Der Inhalt bleibt ???, bis der Stein einmal verbaut wurde.
    </p>
  );
}

export function LabPanel({ lab, essence, onBuy, onPlace, onClose }) {
  const [dragged, setDragged] = useState(null);
  const onDragStart = (event, seed) => {
    setDragged(seed);
    event.dataTransfer.setData('text/plain', String(seed));
  };
  const onDrop = (slot) => {
    if (dragged !== null) onPlace(dragged, slot);
    setDragged(null);
  };

  return (
    <section className="dl-panel dl-panel-in w-[min(94vw,420px)] rounded-2xl px-3 pb-3 pt-2.5" aria-label="Labor des Brutlords">
      <LabHeader onClose={onClose} />
      <LabTray lab={lab} essence={essence} full={labIsFull(lab)} onBuy={onBuy} />
      <div className="flex gap-3 pt-3">
        <div className="min-w-0 flex-1">
          <LabInventory lab={lab} onDragStart={onDragStart} />
        </div>
        <div className="shrink-0">
          <LabBench placed={placedStones(lab)} onDrop={onDrop} />
        </div>
      </div>
      <LabFooter />
    </section>
  );
}