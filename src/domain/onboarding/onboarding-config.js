/**
 * Alle Zeiten und Tuning-Werte des Onboardings an einem Ort.
 * Keine Komponente darf eigene Magic Numbers für den Spielablauf benutzen —
 * Reducer und Engine lesen ausschließlich hier.
 */
export const ONBOARDING_CONFIG = Object.freeze({
  /** Kurze Reaktion direkt beim Klick: der Hive sackt zusammen, Klick sitzt. */
  hiveHitDurationMs: 320,

  /** Danach die große Mutationsphase: Puls, Kern öffnet sich, Partikel. */
  hiveMutationDurationMs: 900,

  /** Genau 5 Sekunden nach dem Klick erscheint der erste Dungling. */
  dunglingSpawnDelayMs: 5000,

  /** Wie lange der Dungling sichtbar aus dem Boden kriecht. */
  dunglingEmergeMs: 600,

  /** Kurze Ruhe, danach wird der nächste sinnvolle Erdblock hervorgehoben. */
  dunglingSettleMs: 500,

  /** Der Dungling läuft sichtbar zum gewählten Tile. */
  workerMoveDurationMs: 500,

  /** Dauer des Abbaus (0 → 100 %). */
  miningDurationMs: 3500,

  /** Sim-Uhr des Abbaus: jeder Tick ist ein definierter Fortschrittsschritt. */
  miningTickMs: 100,

  /** Nach dem Zerfall liegt der neue Boden kurz still, bevor das Grid wächst. */
  tileDestructionMs: 700,

  /** Das Grid wächst sichtbar, danach erscheint erst das Baumenü. */
  gridExpansionMs: 600,

  /**
   * Erd-Zustände als Anteil des Fortschritts:
   * 0–45 % HEALTHY, 45–80 % TOUCHED, 80–100 % CRITICAL.
   */
  earthStateThresholds: Object.freeze({ touched: 0.45, critical: 0.8 }),

  /** Startposition des ersten Dunglings: freigeschobener Hive-Eingang. */
  dunglingSpawnTile: Object.freeze({ x: 31, y: 33 }),

  /** Blöcke in Sichtweite des Hive, die zuerst hervorgehoben werden. */
  firstEarthBlock: Object.freeze({ x: 32, y: 33 }),

  /** Rein visuelle Partikelwerte (beeinflussen keinen Spielzustand). */
  particleBurstIntervalMs: 240,
  particleLifetimeMs: 950,
  particlesPerBurst: 4,
});
