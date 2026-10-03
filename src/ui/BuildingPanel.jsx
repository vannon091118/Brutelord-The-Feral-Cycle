/**
 * Ein ausgewähltes Bauwerk: was es ist, wie weit es ist und — beim Extraktor —
 * wer daran arbeitet. Zuweisen und Freigeben sind die einzigen Befehle hier.
 */
import { BUILDING_STATE, buildingDef } from '../domain/buildings/building-config.js';

function stateText(building) {
  if (building.state === BUILDING_STATE.SITE) {
    return `Bauplatz: ${building.delivered} von ${building.required} Essenz angekommen`;
  }
  return 'Fertig gebaut und in Betrieb.';
}

function PanelHeader({ def, onClose }) {
  return (
    <header className="flex items-start justify-between gap-2 px-0.5 pb-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold tracking-wide text-bone-100">{def.label}</h2>
        <span className="text-[10px] text-bone-400">{def.hint}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-full border border-bone-400/20 px-2 py-[2px] text-[10px] text-bone-300 transition hover:border-core-400/40"
      >
        Schließen
      </button>
    </header>
  );
}

function WorkerControls({ building, maxWorkers, freeWorkers, onAssign, onRelease }) {
  const buttonClass =
    'rounded-lg border border-bone-400/15 bg-soil-900/70 px-2.5 py-1 text-[11px] text-bone-200 transition hover:border-core-400/40 disabled:opacity-40';
  return (
    <div className="flex items-center justify-between rounded-xl border border-bone-400/10 bg-soil-900/60 px-3 py-2">
      <span className="text-[11px] text-bone-200">
        Zugewiesen {building.workers.length} / {maxWorkers}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={building.workers.length >= maxWorkers || freeWorkers === 0}
          onClick={onAssign}
        >
          + Dungling
        </button>
        <button type="button" className={buttonClass} disabled={building.workers.length === 0} onClick={onRelease}>
          −
        </button>
      </div>
    </div>
  );
}

/** Nur der Extraktor beschäftigt Dunglinge — nur dort gibt es die Bedienung. */
function WorkerSection({ building, maxWorkers, freeWorkers, onAssign, onRelease }) {
  if (maxWorkers === 0) return null;
  return (
    <div className="pt-2">
      <WorkerControls
        building={building}
        maxWorkers={maxWorkers}
        freeWorkers={freeWorkers}
        onAssign={onAssign}
        onRelease={onRelease}
      />
      <p className="px-0.5 pt-2 text-[10px] leading-snug text-bone-400">
        Jeder zugewiesene Dungling presst eine Essenz je Zyklus und trägt sie zum Hive.
      </p>
    </div>
  );
}

export function BuildingPanel({ building, freeWorkers, onAssign, onRelease, onClose }) {
  const def = buildingDef(building.type);
  return (
    <section
      className="dl-panel dl-panel-in w-[min(92vw,352px)] rounded-2xl px-3 pb-3 pt-2.5"
      aria-label={`Bauwerk: ${def.label}`}
    >
      <PanelHeader def={def} onClose={onClose} />
      <p className="px-0.5 text-[11px] text-bone-300">{stateText(building)}</p>
      <WorkerSection
        building={building}
        maxWorkers={def.maxWorkers ?? 0}
        freeWorkers={freeWorkers}
        onAssign={onAssign}
        onRelease={onRelease}
      />
    </section>
  );
}
