function SoilGradients() {
  return (
    <>
      <linearGradient id="dl-crust" x1="0" y1="0" x2="0.12" y2="1">
        <stop offset="0%" stopColor="var(--color-soil-500)" />
        <stop offset="100%" stopColor="var(--color-soil-700)" />
      </linearGradient>
      <linearGradient id="dl-crustTop" x1="0.1" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="var(--color-soil-400)" />
        <stop offset="100%" stopColor="var(--color-soil-600)" />
      </linearGradient>
      <linearGradient id="dl-floor" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0%" stopColor="var(--color-soil-600)" />
        <stop offset="100%" stopColor="var(--color-soil-800)" />
      </linearGradient>
      <linearGradient id="dl-rawSoil" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="var(--color-soil-700)" />
        <stop offset="100%" stopColor="var(--color-soil-950)" />
      </linearGradient>
    </>
  );
}

function LightGradients() {
  return (
    <>
      <radialGradient id="dl-floorLight">
        <stop offset="0%" stopColor="var(--color-core-300)" stopOpacity="0.45" />
        <stop offset="60%" stopColor="var(--color-core-500)" stopOpacity="0.12" />
        <stop offset="100%" stopColor="var(--color-core-500)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="dl-coreHalo">
        <stop offset="0%" stopColor="var(--color-core-300)" stopOpacity="0.55" />
        <stop offset="55%" stopColor="var(--color-core-500)" stopOpacity="0.2" />
        <stop offset="100%" stopColor="var(--color-core-500)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="dl-core">
        <stop offset="0%" stopColor="var(--color-core-300)" />
        <stop offset="42%" stopColor="var(--color-core-500)" />
        <stop offset="100%" stopColor="var(--color-hive-800)" />
      </radialGradient>
    </>
  );
}

function CharacterGradients() {
  return (
    <>
      <linearGradient id="dl-hiveShell" x1="0.2" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="var(--color-hive-700)" />
        <stop offset="100%" stopColor="var(--color-hive-800)" />
      </linearGradient>
      <linearGradient id="dl-hiveMid" x1="0.2" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="var(--color-hive-500)" />
        <stop offset="100%" stopColor="var(--color-hive-700)" />
      </linearGradient>
      <linearGradient id="dl-hiveTop" x1="0.25" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="var(--color-hive-400)" />
        <stop offset="100%" stopColor="var(--color-hive-600)" />
      </linearGradient>
      <linearGradient id="dl-body" x1="0.2" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="var(--color-clay-500)" />
        <stop offset="100%" stopColor="var(--color-clay-600)" />
      </linearGradient>
    </>
  );
}

function AtmosphereDefs() {
  return (
    <>
      <radialGradient id="dl-vignette" cx="50%" cy="42%" r="72%">
        <stop offset="45%" stopColor="var(--color-soil-950)" stopOpacity="0" />
        <stop offset="100%" stopColor="var(--color-soil-950)" stopOpacity="0.88" />
      </radialGradient>
      <pattern id="dl-grit" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="3" r="0.75" fill="var(--color-soil-950)" opacity="0.5" />
        <circle cx="6.4" cy="6.8" r="0.55" fill="var(--color-soil-300)" opacity="0.06" />
      </pattern>
      <filter id="dl-softGlow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="3.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </>
  );
}

/** Farbverläufe und Filter der SVG-Welt. */
export function WorldDefs() {
  return (
    <defs>
      <SoilGradients />
      <LightGradients />
      <CharacterGradients />
      <AtmosphereDefs />
    </defs>
  );
}
