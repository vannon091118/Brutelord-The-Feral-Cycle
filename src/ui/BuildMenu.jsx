import { tileCenter } from '../domain/world/tile.js';
import { GRID_SIZE, tileUnitsToPercent } from '../domain/world/world-config.js';

const ITEMS = [
  { id: 'wall', label: 'Wand' },
  { id: 'door', label: 'Tür' },
  { id: 'torch', label: 'Fackel' },
];

function ItemIcon({ id }) {
  if (id === 'wall') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="1.6" fill="#4a3519" />
        <path d="M3 11 H21 M3 15.5 H21 M9 6 V11 M15 11 V15.5 M9 15.5 V19 M18 6 V11"
          stroke="#2a1d0d" strokeWidth="1.1" />
        <path d="M3 7 H21" stroke="#8a6537" strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }
  if (id === 'door') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M6 20 V10 C6 6.9 8.7 4.5 12 4.5 C15.3 4.5 18 6.9 18 10 V20 Z" fill="#3a2a16" />
        <path
          d="M6 20 V10 C6 6.9 8.7 4.5 12 4.5 C15.3 4.5 18 6.9 18 10 V20"
          fill="none"
          stroke="#a9774a"
          strokeWidth="1.4"
        />
        <circle cx="15" cy="13" r="1.1" fill="#e0b070" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M11 20 L13.5 10" stroke="#8a6537" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M13.6 10.2 C15.8 9.6 17 7.4 16.4 4.4 C14.4 5 12.4 6.4 12 8.4 C11.7 9.8 12.4 10.6 13.6 10.2 Z"
        fill="#e0a75a"
      />
      <path
        d="M13.4 9 C14.2 8.8 14.6 8 14.4 6.9 C13.5 7.2 12.9 7.8 12.8 8.6"
        fill="#ffd9a0"
      />
    </svg>
  );
}

/**
 * The build menu is the logical consequence of the mined tile.
 * It is small, close to the world and looks like it belongs to it.
 */
export default function BuildMenu({ tile, usableTiles, onClose }) {
  const center = tileCenter(tile);
  const left = tileUnitsToPercent(center.x);
  // keep the panel clear of the fresh tile itself
  const below = center.y >= GRID_SIZE / 2;
  const top = tileUnitsToPercent(center.y + (below ? 0.75 : -0.75));

  return (
    <div
      className="dl-reduce-motion pointer-events-auto absolute z-20"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animation: `dl-panel-in 260ms cubic-bezier(0.2, 0.9, 0.25, 1) both`,
      }}
    >
      <div className="w-[13.5rem] rounded-2xl border border-[#7a5527]/45 bg-[#140e09]/96 p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-[2px]">
        <div className="flex items-start justify-between gap-2 px-1">
          <div>
            <div className="text-[11px] tracking-[0.18em] text-[#e0b070] uppercase">Bauen</div>
            <div className="mt-0.5 text-[10px] tracking-wide text-[#8a7355]">
              Freier Dungeonboden
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Baumenü schließen"
            className="-mt-0.5 grid h-4 w-4 place-items-center rounded text-[#8a6f4d] transition-colors hover:bg-[#3a2a18] hover:text-[#e3c79a]"
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

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#5c4322]/50 bg-[#1e150b] px-1 py-2"
            >
              <span className="text-[#c9a06a]">
                <ItemIcon id={item.id} />
              </span>
              <span className="text-[10px] tracking-wide text-[#b39a76]">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between rounded-lg bg-[#1b1209] px-2 py-1.5">
          <span className="text-[10px] tracking-[0.12em] text-[#7f6a4c] uppercase">
            Nutzbarer Raum
          </span>
          <span className="text-[11px] font-medium tracking-wide text-[#e0b070]">
            {usableTiles} {usableTiles === 1 ? 'Tile' : 'Tiles'}
          </span>
        </div>
      </div>
    </div>
  );
}