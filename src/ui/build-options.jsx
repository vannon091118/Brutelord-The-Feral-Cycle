// @doc: docs/daten/ui/build-options.md#build-options
import { BUILDING_TYPE } from '../domain/buildings/building-config.js';

export const BUILD_OPTIONS = [
  {
    type: BUILDING_TYPE.SWARM_HOST,
    glyph: (
      <g>
        <path
          d="M12 2.6c4.2 0 6.6 2.5 6.6 5.8 0 4.1-3.1 6.4-6.6 9.7-3.5-3.3-6.6-5.6-6.6-9.7C5.4 5.1 7.8 2.6 12 2.6Z"
          fill="var(--color-hive-600)"
          stroke="var(--color-hive-400)"
          strokeWidth="1"
        />
        <circle cx="9.3" cy="9.4" r="1.7" fill="var(--color-core-500)" />
        <circle cx="13.8" cy="12.2" r="2" fill="var(--color-core-500)" opacity="0.8" />
        <circle cx="15" cy="7.9" r="1.2" fill="var(--color-core-400)" />
      </g>
    ),
  },
  {
    type: BUILDING_TYPE.ESSENCE_EXTRACTOR,
    glyph: (
      <g>
        <path d="M3.4 18.4h17.2l-1.6 3.2H5z" fill="var(--color-rock-600)" />
        <path d="M12 2.6 15.6 10H8.4z" fill="var(--color-rock-500)" />
        <path d="M12 6.4 14 11.2H10z" fill="var(--color-core-400)" />
        <path d="M12 12.4 15 15.4 12 18.4 9 15.4z" fill="var(--color-core-300)" />
        <path d="M4.6 15.4h3.2M16.2 15.4h3.2" stroke="var(--color-core-600)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    type: BUILDING_TYPE.BRUTE_LORD,
    glyph: (
      <g>
        <path
          d="M2.8 15.6c0-6.2 4.1-10.4 9.2-10.4s9.2 4.2 9.2 10.4c0 3.1-4.1 5.2-9.2 5.2s-9.2-2.1-9.2-5.2Z"
          fill="var(--color-hive-700)"
          stroke="var(--color-hive-500)"
          strokeWidth="1"
        />
        <path d="M6.2 8.2 9 3.1l2.1 4.8zM17.8 8.2 15 3.1l-2.1 4.8z" fill="var(--color-soil-700)" />
        <ellipse cx="12" cy="14.4" rx="4.6" ry="2.3" fill="var(--color-hive-800)" />
        <circle cx="12" cy="14.2" r="1.5" fill="var(--color-core-500)" />
        <path d="M7.4 11.2h9.2" stroke="var(--color-hive-400)" strokeWidth="1.1" opacity="0.85" />
      </g>
    ),
  },
];
