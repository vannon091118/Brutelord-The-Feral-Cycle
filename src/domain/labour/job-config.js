/**
 * Die Zeiten der Arbeit: wie schnell ein Dungling läuft, wie lange ein
 * Handgriff dauert und wie lange ein Extraktor für eine Essenz braucht.
 * Alles an einem Ort — Reducer und Uhr lesen dieselben Zahlen, und der
 * Ablauf bleibt prüfbar, ohne einen Browser zu starten.
 */
export const JOB_CONFIG = Object.freeze({
  /** Takt der Arbeitsuhr. Fein genug, dass Wege fließen statt zu springen. */
  tickMs: 200,

  /** Ein Feld Laufweg — daraus entsteht jede Wegdauer. */
  travelMsPerTile: 420,

  /** Eine Essenz aufnehmen oder abladen. */
  workMs: 300,

  /** Ein zugewiesener Dungling presst genau eine Essenz pro Zyklus. */
  cycleMs: 15000,

  /** Wie lange ein +1-Symbol über dem Abladeort steht. */
  popupLifetimeMs: 1600,
});
