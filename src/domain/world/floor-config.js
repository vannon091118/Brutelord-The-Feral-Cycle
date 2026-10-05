/** Die Konstanten der Etagen: Tiefe, Salz und was ein Sprung kostet. */
export const FLOOR = Object.freeze({
  start: 0,
  /** [FUTURE] Der Wert ist eine Absicht, kein Limit: er wächst mit dem Content. */
  deepest: 8,
  /** Salz, damit Tiefe 0 nicht dieselbe Welt ist wie die anonyme Welt ohne Tiefe. */
  seedSalt: 0x1f0a2b,
});