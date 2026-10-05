/** Der Spielstand auf der Platte: welche Fassung, welcher Schlüssel, wie oft.
 *  Fassung 2 traegt die Tiefe der Etage; ein Stand aus Fassung 1 wird verworfen. */
export const SNAPSHOT_VERSION = 2;
export const SNAPSHOT_KEY = 'dl.snapshot';
export const SNAPSHOT_EVERY_MS = 5000;