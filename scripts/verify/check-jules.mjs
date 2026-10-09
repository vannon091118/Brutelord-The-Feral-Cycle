/** Das Jules-Tor als Regelwerk: Gruppierung, Schwelle, Zweigdeckel, Leiter, der
 *  Workflow als Text — und am Ende der ausgefahrene Ausfuehrungsgraph. */
import { existsSync, readFileSync } from 'node:fs'
import { check, section } from './expect.mjs'
import { JULES_POLICY } from '../jules/jules-policy.mjs'
import { evaluate } from '../jules/jules-guard.mjs'
import { COMMIT_LIMITS, REQUIRED_LABEL } from '../lib/commit-rules.mjs'
import { DATEIEN, SATZ, WORKFLOW, checkJulesLauf } from './check-jules-lauf.mjs'
import {
  automationDecision,
  branchCap,
  checksGreen,
  decisionLines,
  escalationStage,
  groupingKeyOf,
  julesSignal,
  ruleMatchOf,
  stripDetail,
} from '../jules/jules-rules.mjs'

const STUFEN = ['watchdog', 'issue-melder', 'prompter', 'pr-close']

function checkGrouping() {
  const varianten = [
    '[Jules] Importrichtung',
    '[Jules] Importrichtung, Spiegel-Doku',
    '[Jules] Importrichtung, Hard Caps, Versionierung',
    '[Jules] Importrichtung: src/domain/beispiel.js',
    '[Jules] Importrichtung: src/domain/beispiel.js, src/state/beispiel.js',
  ].map((title) => groupingKeyOf({ title }))
  check('Gruppierung: Dateiliste und Kommata aendern den Schluessel nicht', new Set(varianten).size === 1, varianten.join(' | '))
  const perIssue = [12, 12, 13].map((issueNumber) => groupingKeyOf({ issueNumber, title: 'egal' }))
  check('Gruppierung: ein Auftrag ist ein Issue', perIssue[0] === perIssue[1] && perIssue[0] !== perIssue[2], perIssue.join(' '))
  const rest = stripDetail('[Jules] Importrichtung: src/domain/beispiel.js, src/state/beispiel.js')
  check('Der Gruppierungsschluessel nennt keine Datei und kein Komma', !rest.includes('/') && !rest.includes(','), rest)
}

// Nur der Body: den Betreff setzt wie im Workflow das Tor davor.
function bodyOf({ paths = DATEIEN, label = REQUIRED_LABEL } = {}) {
  const liste = `Geaendert wurden diese Dateien: ${paths.join(', ')}.`
  return [proseOf(COMMIT_LIMITS.bodyMinWords), '', liste, '', label, ''].join('\n')
}

function proseOf(words) {
  const proSatz = SATZ.split(' ').length
  return Array.from({ length: Math.ceil(words / proSatz) }, () => SATZ.trim()).join(' ')
}

function checkErkennung() {
  const perAutor = julesSignal({ login: 'jules[bot]' })
  check('Erkennung: der Autor allein genuegt', perAutor.jules && perAutor.via.join(' ') === 'autor', perAutor.via.join(' '))
  const perZweig = julesSignal({ branch: 'jules-refactor-earth-depth-16223455999679297783' })
  check('Erkennung: der Zweigname allein genuegt', perZweig.jules && perZweig.via.join(' ') === 'zweig', perZweig.via.join(' '))
  const fremd = julesSignal({ login: 'vannon', title: 'Bitte die Farbe anpassen', branch: 'feat/etwas' })
  check('Erkennung: ein fremder Antrag bleibt liegen', !fremd.jules, fremd.via.join(' '))
}

const ECHT = {
  login: 'vannon091118',
  branch: 'remove-bugreport-8074749841855159415',
  title: '🧹 [Code Health] Remove unused bugReport and stepLine functions',
  labels: [],
  body: 'Modified files:\n- src/domain/replay/run-report.js\n\n---\n*PR created automatically by Jules for task [8074749841855159415](https://jules.google.com/task/8074749841855159415) started by @vannon091118*',
}

function checkSpuren() {
  const signal = julesSignal(ECHT)
  check('Spuren: der echte Antrag wird an Zweig und Body-Trailer erkannt', signal.jules && signal.via.join(' ') === 'zweig spur', signal.via.join(' '))
  check('Spuren: die Gruppierung folgt der Auftragsnummer aus dem Trailer', groupingKeyOf(ECHT) === 'auftrag-8074749841855159415', groupingKeyOf(ECHT))
  const ohneSpur = julesSignal({ login: 'vannon091118', branch: 'fix/typo', title: 'Fix typo', body: 'Kleiner Tippfehler.', labels: [] })
  check('Spuren: ein menschlicher Antrag ohne Spur bleibt liegen', !ohneSpur.jules, ohneSpur.via.join(' '))
}

function auftrag(extra = {}) {
  return {
    title: '[Jules] Hard Cap: scripts/beispiel.mjs zu lang',
    body: 'Regel: das Zeilenlimit ist ueberschritten, nachgewiesen mit npm run gate -- --tree.',
    labels: [JULES_POLICY.labels.auftrag],
    ...extra,
  }
}

function checkThreshold() {
  const klar = ruleMatchOf(auftrag())
  check('Schwelle: Regel, Nachweis, Pfad und Auftrag ergeben eine klare Passung', klar.clear && klar.rule === 'hard-caps', `${klar.rule} ${klar.score}`)
  const duenn = ruleMatchOf({ title: 'Hard Cap', body: '', labels: [] })
  check('Schwelle: ein Stichwort allein automatisieren nichts', !duenn.clear && duenn.score === JULES_POLICY.threshold.minScore - 1, `Score ${duenn.score}`)
  const fremd = ruleMatchOf({ title: 'Bitte die Farbe anpassen', body: 'Sieht nicht gut aus.', labels: [JULES_POLICY.labels.auftrag] })
  check('Schwelle: ein Anliegen ohne Regel bleibt beim Menschen', !fremd.clear && fremd.rule === null, `Score ${fremd.score}`)
}

function klein(extra = {}) {
  return { files: DATEIEN, additions: 4, deletions: 2, ageMinutes: 10, branches: [], ...extra }
}

function zweige(anzahl) {
  const formen = ['jules-refactor-earth-', 'remove-bugreport-', 'jules/']
  return Array.from({ length: anzahl }, (_, index) => `${formen[index % formen.length]}${String(index + 1).padStart(16, '0')}`)
}

function checkDeckel() {
  const ueber = branchCap({ branches: zweige(JULES_POLICY.maxOpenBranches + 1) })
  check('Deckel: ein Zweig zu viel sperrt die Automatisierung', ueber.over && ueber.drain.length === 1, `${ueber.open}/${ueber.cap}`)
  const genau = branchCap({ branches: zweige(JULES_POLICY.maxOpenBranches) })
  check('Deckel: auf der Grenze wird nichts gesperrt', !genau.over && genau.drain.length === 0, `${genau.open}/${genau.cap}`)
  const fremde = branchCap({ branches: ['feat/etwas', 'main'] })
  check('Deckel: fremde Zweige zaehlen nicht', fremde.open === 0, `${fremde.open}`)
}

function checkLeiter() {
  const stufen = [10, JULES_POLICY.escalation.watchdogMinutes, JULES_POLICY.escalation.issueAfterMinutes, JULES_POLICY.escalation.promptAfterMinutes, JULES_POLICY.escalation.closeAfterMinutes]
    .map((ageMinutes) => escalationStage({ ageMinutes }))
  check('Die Leiter steigt in vier Stufen', stufen.join(' ') === `idle ${STUFEN.join(' ')}`, stufen.join(' '))
  const rueckwaerts = [0, 20, 400].map((ageMinutes) => escalationStage({ ageMinutes }))
  check('Die Leiter kennt keine Stufe unter der Schwelle', rueckwaerts[0] === 'idle' && rueckwaerts[2] === 'pr-close', rueckwaerts.join(' '))
}

function checkEntscheidung() {
  const ohneRegel = automationDecision({ request: { title: 'Farbe anpassen' }, change: klein(), check: { green: true, policyOk: true } })
  check('Ohne klare Regelpassung wird umgeleitet, nicht automatisiert', ohneRegel.action === 'reroute', ohneRegel.reason)
  const kleinGruen = automationDecision({ request: auftrag(), change: klein(), check: { green: true, policyOk: true } })
  check('Klein, gruen und regelkonform wird zusammengefuehrt', kleinGruen.action === 'merge', kleinGruen.reason)
  const altAberGut = automationDecision({ request: auftrag(), change: klein({ ageMinutes: 400 }), check: { green: true, policyOk: true } })
  check('Die Frist schliesst keine Arbeit, die zusammenfuehrbar ist', altAberGut.action === 'merge', altAberGut.reason)
  const nichtGruen = automationDecision({ request: auftrag(), change: klein({ files: [], ageMinutes: 400 }), check: { green: false } })
  check('Ohne gruenen Nachweis schliesst die Frist den Antrag', nichtGruen.action === 'close', nichtGruen.reason)
  const ueberDeckel = automationDecision({ request: auftrag(), change: klein({ files: [], branches: zweige(4) }), check: { green: false } })
  check('Ueber dem Deckel wird zuerst zusammengefuehrt', ueberDeckel.action === 'drain' && ueberDeckel.cap.drain.length === 1, ueberDeckel.reason)
  const innerhalb = automationDecision({ request: auftrag(), change: klein({ files: [] }), check: { green: false } })
  check('Innerhalb des Deckels entsteht kein neuer Zweig', innerhalb.action === 'hold', innerhalb.reason)
}

function checkBelege() {
  const kontext = { request: { ...auftrag(), body: bodyOf() }, change: klein(), checks: [{ conclusion: 'SUCCESS' }] }
  const gut = evaluate(kontext)
  check('Ein regelkonformer Antrag kommt bis zur Zusammenfuehrung', gut.issues.length === 0 && gut.decision.action === 'merge', gut.issues.map((i) => i.rule).join(', '))
  const ohneLabel = evaluate({ ...kontext, request: { ...auftrag(), body: bodyOf({ label: 'fertig' }) } })
  check('Ein Body ohne Pflicht-Label wird abgewiesen', ohneLabel.issues.length > 0 && ohneLabel.decision.action !== 'merge', ohneLabel.issues[0]?.rule)
  check('Grün heisst: alle Pruefungen fertig und keine gefallen', checksGreen([{ conclusion: 'SUCCESS' }, { state: 'NEUTRAL' }]) && !checksGreen([{ conclusion: 'SUCCESS' }, { conclusion: 'FAILURE' }]) && !checksGreen([]))
  const zeilen = decisionLines({ decision: gut.decision, issues: gut.issues })
  check('Die Ausgabe nennt Auftrag, Deckel, Schalter und bleibt einzeilig', zeilen.length === 13 && zeilen.every((zeile) => !/\s$/.test(zeile) && !zeile.includes('\n')) && zeilen.includes(`group=${gut.decision.group}`) && zeilen.includes('merge=true') && zeilen.includes('close=false'), zeilen.join(' '))
}

function checkWorkflowText() {
  const text = existsSync(WORKFLOW) ? readFileSync(WORKFLOW, 'utf8') : ''
  check('Der Workflow existiert', text.length > 0, WORKFLOW)
  check('Der Ausloeser ist Auftrag, Antrag oder Wecker — kein Dateipfad', /^  issues:/m.test(text) && /^  pull_request:/m.test(text) && /^  schedule:/m.test(text) && !/^\s+paths:/m.test(text), 'issues, pull_request, schedule, kein paths')
  check('Ein Push loest die Abzweigung nicht aus', !/^  push:/m.test(text), 'kein push')
  const stellen = STUFEN.map((stufe) => text.indexOf(`\n  ${stufe}:`))
  check('Alle vier Eskalationsstufen stehen als eigene Aufgabe', stellen.every((stelle) => stelle > 0), STUFEN.join(', '))
  check('Die Stufen stehen in der Reihenfolge der Leiter', stellen.every((stelle, index) => index === 0 || stelle > stellen[index - 1]), stellen.join(' < '))
  check('Jules wird erkannt und die Entscheidung kommt aus dem Tor', (text.match(/node scripts\/jules\/jules-guard\.mjs/g) ?? []).length >= 2, 'Aufrufe des Tores')
  const deckel = text.indexOf('- name: Zweigdeckel')
  const zusammen = text.indexOf('- name: Kleine Aenderungen zusammenfuehren')
  check('Der Deckel wird vor der Zusammenfuehrung geprueft', deckel > 0 && zusammen > deckel, `${deckel} < ${zusammen}`)
  check('Zusammengefuehrt wird nur als Squash und mit Zweig-Abbau', /gh pr merge[^\n]*--squash[^\n]*--delete-branch/.test(text), 'gh pr merge --squash --delete-branch')
  check('Der Melder haengt an ein Sammel-Issue statt an jedes Einzelne', /gh issue list/.test(text) && /gh issue comment/.test(text) && /gh issue create/.test(text), 'Sammel-Issue')
  check('Der Melder schliesst mit dem ausdruecklichen Schliesser', /gh pr close/.test(text), 'gh pr close')
  check('Die Abzweigung braucht Schreibrecht auf Antraege und Issues', /issues: write/.test(text) && /pull-requests: write/.test(text) && /contents: write/.test(text), 'permissions')
  check('Der Deckel prueft unter einer Nebenlaeufigkeitsgruppe, die alle Laeufe serialisiert', /^concurrency:\n  group: jules-guard\n/m.test(text), 'concurrency: jules-guard')
  check('Der Arbeitsordner des Runners wird benutzt, kein festes /tmp', /RUNNER_TEMP/.test(text) && !/\/tmp\//.test(text), 'RUNNER_TEMP')
  check('Jede Frist kennt eine tolerante Zeitform', /fromdateiso8601\?/.test(text) && text.includes('Z$"; "Z")'), 'tolerantes Datum')
  check('Das Auftrags-Label der Policy steht auch im Workflow', text.includes(JULES_POLICY.labels.auftrag), JULES_POLICY.labels.auftrag)
  check('Die Zweigform steht im Tor, nicht als Muster im Workflow', !text.includes("grep -E '^jules/'"), 'kein ^jules/-Muster')
  check('Die drei Schalter kommen aus dem Tor, nicht aus einer zweiten Regel', /wert merge/.test(text) && /wert close/.test(text), 'merge/close aus dem Tor')
  check('Jede genannte Aufgabe gibt es wirklich', needsExist(text), 'needs')
}

function needsExist(text) {
  const namen = [...text.matchAll(/^  ([\w-]+):$/gm)].map((treffer) => treffer[1])
  const bedarf = [...text.matchAll(/^    needs: \[([^\]]*)\]$/gm)].flatMap((treffer) => treffer[1].split(',').map((name) => name.trim()).filter(Boolean))
  return namen.length > 1 && bedarf.every((name) => namen.includes(name))
}

export function checkJules() {
  section('Das Jules-Tor: ein Auftrag, ein Zweig, vier Stufen')
  checkGrouping()
  checkErkennung()
  checkSpuren()
  checkThreshold()
  checkDeckel()
  checkLeiter()
  checkEntscheidung()
  checkBelege()
  checkWorkflowText()
  checkJulesLauf()
}
