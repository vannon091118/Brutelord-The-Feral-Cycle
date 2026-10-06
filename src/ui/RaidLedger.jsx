import { useState } from 'react';
import { cadreRule } from '../domain/raid/raid-ticket.js';
import { RAID_WARDEN, teamStamina } from '../domain/raid/raid-config.js';
import { readBookings } from './raid-bookings.js';

// @doc: docs/daten/ui/raidledger.md#raidledger
const WARDEN_SPAN = `${RAID_WARDEN.hp}–${RAID_WARDEN.hp + RAID_WARDEN.hpStep}`;
const OPPOSITION = `${RAID_WARDEN.count} Wächter à ${WARDEN_SPAN} Leben`;
const FOOTNOTE = 'Wächter-Koma und Beute unterwegs haben im Spielstand keinen Platz; der Server bucht erst, was ein eingereichter Raid eingebracht hat.';

function cadreBrief(swarm) {
  const rule = cadreRule({ heroes: swarm.map((worker) => worker.id), dunglings: swarm });
  if (!rule.ok) return { ready: false, text: rule.reason };
  const line = `${rule.heroes.length} Wesen · ${rule.grit} Grit · ${teamStamina(rule.grit)} Ausdauer`;
  return { ready: true, text: line };
}

function BriefRow({ label, ready, text }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-bone-400">{label}</dt>
      <dd className={`text-right ${ready === false ? 'text-bone-300' : 'text-bone-100'}`}>{text}</dd>
    </div>
  );
}

function Brief({ swarm }) {
  const kader = cadreBrief(swarm);
  return (
    <dl className="flex flex-col gap-1 px-0.5 text-[11px]">
      <BriefRow label="Kader" ready={kader.ready} text={kader.text} />
      <BriefRow label="Gegner" text={OPPOSITION} />
    </dl>
  );
}

function LootRow({ row, index }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-bone-400/10 bg-soil-900/60 px-2 py-1.5">
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="text-[10px] tabular-nums text-bone-400">{index}</span>
        <span className="truncate text-[11px] text-bone-200">{row.defender}</span>
      </span>
      <span className="flex shrink-0 items-baseline gap-1.5 text-[11px] tabular-nums">
        <span className="text-core-300">◆ {row.essence}</span>
        <span className="text-blood-400">♦ {row.bloodstone}</span>
      </span>
    </li>
  );
}

function LootBody({ view }) {
  if (view.busy) return <p className="px-0.5 text-[11px] text-bone-400">Liest die Quittungen …</p>;
  if (view.error) return <p className="px-0.5 text-[11px] leading-snug text-bone-300">{view.error}</p>;
  if (view.rows.length === 0) {
    return <p className="px-0.5 text-[11px] text-bone-400">Noch keine Beute: Dieser Kader ist nicht gegen einen fremden Hive gezogen.</p>;
  }
  return (
    <ul className="flex max-h-[34vh] flex-col gap-1 overflow-y-auto" aria-label="Beute-Quittungen">
      {view.rows.map((row, index) => (
        <LootRow key={row.id || index} row={row} index={index + 1} />
      ))}
    </ul>
  );
}

function HeadButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-bone-400/20 px-2 py-[2px] text-[10px] text-bone-300 transition-colors hover:border-core-400/40 hover:text-bone-100"
    >
      {label}
    </button>
  );
}

function RaidPanel({ view, swarm, onReload, onClose }) {
  return (
    <section className="dl-panel dl-panel-in w-[min(92vw,320px)] rounded-2xl px-3 pb-3 pt-2.5" aria-label="Raid">
      <header className="flex items-start justify-between gap-2 px-0.5 pb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold tracking-wide text-bone-100">Raid</h2>
          <span className="text-[10px] text-bone-400">Kader und Beute</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <HeadButton label="Neu lesen" onClick={onReload} />
          <HeadButton label="Schließen" onClick={onClose} />
        </div>
      </header>
      <Brief swarm={swarm} />
      <div className="mt-2 border-t border-bone-400/10 pt-2">
        <LootBody view={view} />
      </div>
      <p className="px-0.5 pt-2 text-[10px] leading-snug text-bone-400">{FOOTNOTE}</p>
    </section>
  );
}

export function RaidLedger({ token, swarm }) {
  const [view, setView] = useState(null);
  const load = () => {
    setView({ busy: true, rows: [] });
    readBookings(token).then((answer) => setView(answer.ok ? { ...answer, busy: false } : { ...answer, rows: [] }));
  };

  if (!view) {
    return (
      <button
        type="button"
        onClick={load}
        title="Kader, Gegner und die gebuchte Beute des Raids"
        className="rounded border border-bone-700/40 bg-soil-900/70 px-2 py-1 text-[10px] text-bone-400 transition-colors hover:text-bone-100"
      >
        Raid
      </button>
    );
  }
  return <RaidPanel view={view} swarm={swarm} onReload={load} onClose={() => setView(null)} />;
}
