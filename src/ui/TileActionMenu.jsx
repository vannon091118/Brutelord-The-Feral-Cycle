import { tileCenter } from '../domain/world/tile.js';
import { tileUnitsToPercent } from '../domain/world/world-config.js';

/**
 * The context menu sits right on the tile, over the still visible world.
 * It offers exactly one action in this slice.
 */
export default function TileActionMenu({ tile, onMine, onClose }) {
  const center = tileCenter(tile);
  const left = tileUnitsToPercent(center.x);
  const top = tileUnitsToPercent(center.y);

  return (
    <div
      className="dl-reduce-motion pointer-events-auto absolute z-20"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animation: 'dl-overlay-in 220ms cubic-bezier(0.2, 0.9, 0.25, 1) both',
      }}
    >
      <div className="w-[8.5rem] rounded-xl border border-[#6b4a26]/50 bg-[#150f09]/95 p-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.6)] backdrop-blur-[2px]">
        <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5">
          <span className="text-[10px] tracking-[0.14em] text-[#c9a06a] uppercase">
            Erdblock
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menü schließen"
            className="-mt-0.5 -mr-0.5 grid h-4 w-4 place-items-center rounded text-[#8a6f4d] transition-colors hover:bg-[#3a2a18] hover:text-[#e3c79a]"
          >
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
              <path
                d="M1 1 L9 9 M9 1 L1 9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onMine}
          className="flex w-full items-center gap-2 rounded-lg border border-[#7a5527]/40 bg-[#241809] px-2 py-1.5 text-left transition-colors hover:border-[#b07a3c]/70 hover:bg-[#33210e]"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <path d="M3 12 L11 4" stroke="#c9a06a" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M7.5 3.2 C9.6 2.4 12.4 3 13.6 4.6 C11.8 5.6 9.4 5.4 7.9 4.4 Z"
              fill="#a9774a"
            />
            <path d="M2 13.4 C3.4 12.8 4.6 13.2 5.2 14 L2 14 Z" fill="#6b4a2c" />
          </svg>
          <span className="text-[13px] font-medium tracking-wide text-[#e8d3ad]">Abbau</span>
        </button>
      </div>

      <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-[#6b4a26]/50 bg-[#150f09]" />
    </div>
  );
}