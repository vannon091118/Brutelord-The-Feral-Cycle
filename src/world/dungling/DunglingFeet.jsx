/**
 * Schatten und Füße: verankern den Dungling auf seinem Tile.
 */
export function DunglingFeet() {
  return (
    <>
      <ellipse cx="0" cy="10" rx="12" ry="3.3" fill="var(--color-soil-950)" opacity="0.4" />
      <ellipse cx="-6" cy="8.4" rx="3.6" ry="2.4" fill="var(--color-soil-700)" />
      <ellipse cx="5.4" cy="8.4" rx="3.6" ry="2.4" fill="var(--color-soil-700)" />
    </>
  );
}
