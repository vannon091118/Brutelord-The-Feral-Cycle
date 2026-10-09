/** Die Zahlen und Spuren des Jules-Tores stehen hier und sonst nirgends.
 *  Die Spuren sind gemessen, nicht geraten: in diesem Repository ist der Autor
 *  des Antrags der Mensch, der Zweig traegt die Task-Nummer, und der Body sagt
 *  selbst, wer ihn geschrieben hat. Der Zweigname allein taugt nicht — er
 *  faengt zwei von acht Zweigen. */
export const JULES_POLICY = Object.freeze({
  markers: Object.freeze(['jules.google.com/task/', 'created automatically by Jules']),
  taskPattern: 'jules\\.google\\.com/task/([0-9]+)',
  branchPrefixes: Object.freeze(['jules/', 'jules-']),
  branchTaskSuffix: '-[0-9]{16,}$',
  actors: Object.freeze(['jules[bot]', 'google-jules[bot]', 'jules-ai[bot]']),
  titlePrefix: '[jules]',
  labels: Object.freeze({
    auftrag: 'jules:auftrag',
    watchdog: 'jules:watchdog',
    issue: 'jules:issue',
    prompter: 'jules:prompter',
    close: 'jules:close',
  }),
  maxOpenBranches: 3,
  small: Object.freeze({ maxFiles: 3, maxLines: 120 }),
  threshold: Object.freeze({ minScore: 2 }),
  rules: Object.freeze({
    importrichtung: Object.freeze(['importrichtung', 'schichtung', 'import-rules']),
    'hard-caps': Object.freeze(['hard cap', 'cap-verletzung', 'zeilenlimit', 'dateilimit']),
    'commit-policy': Object.freeze(['commit-policy', 'commit-body', 'vannon-label']),
    versionierung: Object.freeze(['versionierung', 'version.lock', 'revision']),
    'doku-metadaten': Object.freeze(['metadaten', 'roadmap_open', 'checkpoints']),
    'spiegel-doku': Object.freeze(['spiegel-doku', 'spiegel-datei', '@doc', 'docs/daten']),
  }),
  escalation: Object.freeze({
    watchdogMinutes: 45,
    issueAfterMinutes: 90,
    promptAfterMinutes: 150,
    closeAfterMinutes: 240,
  }),
})
