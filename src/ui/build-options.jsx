/**
 * Die Bauoptionen als Daten. Die Formen sind inline SVG — kein Asset, keine
 * Icon-Bibliothek, direkt im Code iterierbar.
 */
export const BUILD_OPTIONS = [
  {
    id: 'wall',
    label: 'Wand',
    hint: 'Grenze ziehen',
    glyph: (
      <g>
        <path d="M2 8h20v14H2z" fill="var(--color-soil-500)" />
        <path d="M2 8h20v3H2z" fill="var(--color-soil-400)" />
        <path d="M7 11v11M13 11v11M18 11v11" stroke="var(--color-soil-800)" strokeWidth="1.4" />
        <path d="M2 15.5h20" stroke="var(--color-soil-800)" strokeWidth="1.4" />
      </g>
    ),
  },
  {
    id: 'door',
    label: 'Tür',
    hint: 'Durchgang',
    glyph: (
      <g>
        <path d="M4 4h16v18H4z" fill="var(--color-soil-600)" />
        <path d="M8 6h8v16H8z" fill="var(--color-soil-800)" />
        <path
          d="M8 6h8v16H8z"
          fill="none"
          stroke="var(--color-core-500)"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <circle cx="13.6" cy="14" r="1.2" fill="var(--color-core-400)" />
      </g>
    ),
  },
  {
    id: 'torch',
    label: 'Fackel',
    hint: 'Licht',
    glyph: (
      <g>
        <path d="M11 11h2v11h-2z" fill="var(--color-soil-500)" />
        <path
          d="M12 2.5c3 3 4.4 5 4.4 7.2A4.4 4.4 0 0 1 12 14a4.4 4.4 0 0 1-4.4-4.3C7.6 7.5 9 5.5 12 2.5Z"
          fill="var(--color-core-500)"
        />
        <path
          d="M12 6c1.5 1.6 2.2 2.7 2.2 3.8a2.2 2.2 0 0 1-4.4 0C9.8 8.7 10.5 7.6 12 6Z"
          fill="var(--color-core-300)"
        />
      </g>
    ),
  },
];
