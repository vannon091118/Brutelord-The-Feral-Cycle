/** Das Jules-Tor als Ausfuehrungsgraph: der Workflow wird mit Fixtures und
 *  doppelten `gh`/`git` wirklich gefahren — Trigger, `needs`, Schalter, Leiter.
 *  Diese Datei haelt auch die geteilten Fixtures, die der Gruppeneinstieg nutzt. */
import { readFileSync, rmSync } from 'node:fs'
import { check, section } from './expect.mjs'
import { JULES_POLICY } from '../jules/jules-policy.mjs'
import { runWorkflow } from '../jules/jules-runner.mjs'
import { REQUIRED_LABEL } from '../lib/commit-rules.mjs'

export const WORKFLOW = '.github/workflows/jules-guard.yml'
export const DATEIEN = ['src/domain/beispiel.js']
export const SATZ = 'Der Zweig behebt eine Kleinigkeit und nennt jede Datei die er anfasst damit der Body die Pflicht erfuellt. '
const KOERPER = `Die Ueberschreitung des Zeilenlimits ist mit npm run gate -- --tree nachgewiesen.\n\n${SATZ.repeat(6)}\n\nGeaendert wurden diese Dateien: ${DATEIEN.join(', ')}.\n\n${REQUIRED_LABEL}\n`
const PR = { author: { login: 'jules[bot]' }, labels: [{ name: JULES_POLICY.labels.auftrag }], additions: 4, deletions: 2,
  files: [{ path: DATEIEN[0] }], headRefOid: 'abc123', state: 'OPEN', comments: [], statusCheckRollup: [{ conclusion: 'SUCCESS' }] }
const SCHREIBEND = [
  { match: '^gh pr edit', out: '' }, { match: '^gh label create', out: '' }, { match: '^gh pr comment', out: '' },
  { match: '^gh pr close', out: '' }, { match: '^gh pr merge', out: '' }, { match: '^gh issue create', out: '' },
  { match: '^gh issue comment', out: '' },
]
const OHNE_ANTRAG = { match: '^gh pr list --state open --limit 100 --json headRefName', out: '[]' }
const OHNE_ZWEIG = [{ match: 'ls-remote', out: '' }]
const WECKER = { event_name: 'schedule', repository: 'v/x', event: {} }
const PREREIGNIS = (nummer) => ({ event_name: 'pull_request', repository: 'v/x', event: { pull_request: { number: nummer } } })
const ISSUEEREIGNIS = (nummer, label) => ({ event_name: 'issues', repository: 'v/x', event: { action: 'labeled', label: { name: label }, issue: { number: nummer } } })

function iso(minuten, millis = false) {
  const stempel = new Date(Date.now() - minuten * 60e3).toISOString()
  return millis ? stempel : stempel.replace(/\.\d{3}Z$/, 'Z')
}

function antragJSON(extra = {}) {
  return JSON.stringify({
    title: '[Jules] Hard Caps: src/domain/beispiel.js zu lang',
    body: KOERPER,
    createdAt: iso(10),
    ...PR,
    ...extra,
  })
}

function zahl(aufrufe, muster) {
  return aufrufe.filter((zeile) => new RegExp(muster).test(zeile)).length
}

// Aufrufe einzeilig und kurz: ein mehrzeiliger Body macht den Bericht unlesbar.
function kurz(aufrufe, muster = '') {
  return aufrufe.filter((zeile) => new RegExp(muster).test(zeile)).map((zeile) => zeile.replace(/\s+/g, ' ').slice(0, 110)).join(' | ')
}

function lauf(text, { github, gh, git = OHNE_ZWEIG }) {
  const ergebnis = runWorkflow({ text, github, gh, git })
  rmSync(ergebnis.dir, { recursive: true, force: true })
  return ergebnis
}

function checkMergeLauf(text) {
  const s = lauf(text, { github: PREREIGNIS(7), gh: [OHNE_ANTRAG, { match: '^gh pr view 7 ', out: antragJSON() }, ...SCHREIBEND] })
  check('Ausgefuehrt: ein kleiner gruener Antrag wird zusammengefuehrt', s.jobs.route.outputs.merges !== '[]' && s.jobs.route.outputs.merges !== '', s.jobs.route.outputs.merges)
  check('Ausgefuehrt: der zusammengefuehrte Antrag gilt nicht als liegengeblieben', s.jobs.route.outputs.blocked === '[]', s.jobs.route.outputs.blocked)
  check('Ausgefuehrt: genau ein Squash-Merge mit festgehaltener Revision', zahl(s.gh, '^gh pr merge 7 .*--squash.*--match-head-commit abc123') === 1, kurz(s.gh, '^gh pr merge'))
  check('Ausgefuehrt: die Leiter meldet dabei nichts und schliesst nichts', zahl(s.gh, '^gh (pr comment|pr close|issue create|issue comment)') === 0)
  const schon = lauf(text, {
    github: PREREIGNIS(7),
    gh: [{ match: '^gh pr view 7 --json state,title,body,headRefOid', out: JSON.stringify({ state: 'MERGED', title: 'x', body: KOERPER, headRefOid: 'abc123' }) },
      OHNE_ANTRAG, { match: '^gh pr view 7 ', out: antragJSON() }, ...SCHREIBEND],
  })
  check('Ausgefuehrt: ein zweiter Lauf fuehrt denselben Antrag nicht ein zweites Mal zusammen', schon.jobs.route.outputs.merges !== '[]' && zahl(schon.gh, '^gh pr merge') === 0, kurz(schon.gh, '^gh pr merge'))
}

function checkLeiterLauf(text) {
  const ohneRegel = antragJSON({ title: 'Bitte die Farbe anpassen', body: 'Sieht nicht gut aus.' })
  const s = lauf(text, {
    github: PREREIGNIS(7),
    gh: [OHNE_ANTRAG, { match: '^gh pr view 7 --json comments', out: JSON.stringify({ comments: [] }) },
      { match: '^gh pr view 7 ', out: ohneRegel }, { match: '^gh issue list', out: '[]' }, ...SCHREIBEND],
  })
  check('Ausgefuehrt: ohne Regelpassung entsteht kein Merge', s.jobs.route.outputs.action === 'reroute' && s.jobs.route.outputs.merges === '[]', s.jobs.route.outputs.action)
  check('Ausgefuehrt: der Antrag landet auf der Leiter, nicht im Papierkorb', s.jobs.route.outputs.blocked !== '[]' && s.jobs.route.outputs.blocked !== '', s.jobs.route.outputs.blocked)
  check('Ausgefuehrt: der Prompter mahnt genau einmal und mit Marke', zahl(s.gh, '^gh pr comment 7 ') === 1 && s.gh.some((z) => z.includes('jules-tor:prompter')), kurz(s.gh, '^gh pr comment'))
  check('Ausgefuehrt: der Melder legt ein Sammel-Issue an', zahl(s.gh, '^gh issue create ') === 1 && zahl(s.gh, '^gh issue comment') === 0)
  const eintrag = JSON.parse(s.jobs.route.outputs.blocked)[0]
  const marke = `<!-- jules-tor:melder:${s.gh.find((z) => z.startsWith('gh issue create')).match(/jules-tor:melder:(\w+)/)[1]} -->`
  const s2 = lauf(text, {
    github: PREREIGNIS(7),
    gh: [{ match: '^gh issue list', out: JSON.stringify([{ number: 5, labels: [{ name: 'jules:issue' }] }]) },
      { match: '^gh issue view 5 --json comments', out: JSON.stringify({ comments: [{ body: marke }] }) },
      { match: '^gh pr view 7 --json comments', out: JSON.stringify({ comments: [{ body: `<!-- jules-tor:prompter:${eintrag.stage} -->` }] }) },
      OHNE_ANTRAG, { match: '^gh pr view 7 ', out: ohneRegel }, ...SCHREIBEND],
  })
  check('Ausgefuehrt: unveraenderter Bestand schreibt kein zweites Mal ins Sammel-Issue', zahl(s2.gh, '^gh issue (comment|create)') === 0)
  check('Ausgefuehrt: dieselbe Stufe mahnt kein zweites Mal', zahl(s2.gh, '^gh pr comment 7 ') === 0)
}

function checkWeckerLauf(text) {
  const offen = JSON.stringify([
    { number: 7, headRefName: 'jules/frisch', title: '[Jules] Hard Caps', body: KOERPER, author: { login: 'jules[bot]' }, labels: [], createdAt: iso(60), additions: 4, deletions: 2, files: [{ path: DATEIEN[0] }], statusCheckRollup: [{ conclusion: 'SUCCESS' }] },
    { number: 8, headRefName: 'jules/alt', title: 'Bitte Farbe', body: 'kein Regelbezug', author: { login: 'jules[bot]' }, labels: [], createdAt: iso(300, true), additions: 9, deletions: 9, files: [{ path: 'src/a.js' }], statusCheckRollup: [{ conclusion: 'FAILURE' }] },
  ])
  const s = lauf(text, {
    github: WECKER,
    gh: [{ match: '^gh pr list --state open --limit 100 --json number', out: offen },
      { match: '^gh pr view 7 --json state,title,body,headRefOid', out: antragJSON() },
      { match: '^gh pr view 8 --json state', out: JSON.stringify({ state: 'OPEN' }) }, ...SCHREIBEND],
  })
  check('Ausgefuehrt: der Wecker sammelt beide Antraege', s.jobs.watchdog.outputs.count === '2', s.jobs.watchdog.outputs.count)
  check('Ausgefuehrt: ein Datum mit Millisekunden haelt die Frist nicht an', s.jobs.watchdog.outputs.count === '2')
  check('Ausgefuehrt: der gruene Antrag wird nachgeholt zusammengefuehrt', zahl(s.gh, '^gh pr merge 7 ') === 1, kurz(s.gh, '^gh pr merge'))
  check('Ausgefuehrt: der gerissene Antrag wird geschlossen', zahl(s.gh, '^gh pr close 8 ') === 1, kurz(s.gh, '^gh pr close'))
  check('Ausgefuehrt: der liegengebliebene Antrag traegt die Wecker-Marke', zahl(s.gh, '^gh pr edit 8 --add-label jules:watchdog') === 1)
  check('Ausgefuehrt: es wird erst zusammengefuehrt, dann gemeldet', s.jobs['merge-small'].ran === true && s.jobs['issue-melder'].ran === true)
}

function checkRandlauf(text) {
  const ruhe = lauf(text, { github: { event_name: 'workflow_dispatch', repository: 'v/x', event: {} }, gh: [{ match: '^gh pr list --state open --limit 100 --json number', out: '[]' }, ...SCHREIBEND] })
  check('Ausgefuehrt: ein Dispatch ohne Antrag laeuft nicht in die Abzweigung', ruhe.jobs.route.ran === false && ruhe.jobs.route.failed === false)
  check('Ausgefuehrt: der Wecker findet dabei nichts und schreibt nichts', ruhe.jobs.watchdog.outputs.count === '0' && zahl(ruhe.gh, '^gh (pr merge|pr close|pr comment|issue)') === 0)
  const fremd = lauf(text, { github: ISSUEEREIGNIS(3, 'bug'), gh: [...SCHREIBEND] })
  check('Ausgefuehrt: ein fremdes Label startet die Abzweigung nicht', fremd.jobs.route.ran === false && zahl(fremd.gh, '^gh ') === 0)
  const auftrag = lauf(text, {
    github: ISSUEEREIGNIS(12, JULES_POLICY.labels.auftrag),
    gh: [{ match: '^gh issue view 12 ', out: JSON.stringify({ title: '[Jules] Hard Caps: scripts/beispiel.mjs zu lang', body: 'Die Ueberschreitung ist mit npm run gate -- --tree nachgewiesen.', author: { login: 'vannon' }, labels: [{ name: JULES_POLICY.labels.auftrag }], createdAt: iso(5) }) },
      { match: '^gh pr list --state open --limit 100 --json headRefName', out: JSON.stringify([1, 2, 3, 4].map((n) => ({ headRefName: `jules/${n}-sache`, createdAt: iso(n) }))) },
      { match: '^gh issue list', out: '[]' }, ...SCHREIBEND],
    git: [{ match: 'ls-remote', out: 'a\trefs/heads/jules/1-sache\n' }],
  })
  check('Ausgefuehrt: ein Auftrag ueber dem Deckel wird nicht automatisiert', auftrag.jobs.route.outputs.action === 'drain' && auftrag.jobs.route.outputs.merges === '[]', auftrag.jobs.route.outputs.action)
  check('Ausgefuehrt: der gesperrte Auftrag wird gemeldet, aber nicht gemahnt', zahl(auftrag.gh, '^gh issue create') === 1 && zahl(auftrag.gh, '^gh pr comment') === 0)
  const zu = lauf(text, {
    github: WECKER,
    gh: [{ match: '^gh pr list --state open --limit 100 --json number', out: JSON.stringify([{ number: 9, headRefName: 'jules/9', title: 'Bitte Farbe', body: 'x', author: { login: 'jules[bot]' }, labels: [], createdAt: iso(400), additions: 3, deletions: 3, files: [{ path: 'src/a.js' }], statusCheckRollup: [{ conclusion: 'FAILURE' }], comments: [] }]) },
      { match: '^gh pr view 9 --json state', out: JSON.stringify({ state: 'CLOSED' }) }, ...SCHREIBEND],
  })
  check('Ausgefuehrt: ein bereits geschlossener Antrag wird nicht erneut geschlossen', zahl(zu.gh, '^gh pr close 9 ') === 0)
}

function checkChurn(text) {
  const alt = (minuten) => antragJSON({ title: 'Bitte die Farbe anpassen', body: 'Sieht nicht gut aus.', createdAt: iso(minuten, true) })
  const bau = (minuten, liste, kommentare) => lauf(text, {
    github: PREREIGNIS(7),
    gh: [{ match: '^gh issue list', out: liste },
      { match: '^gh issue view 5 --json comments', out: JSON.stringify({ comments: kommentare }) },
      { match: '^gh pr view 7 --json comments', out: JSON.stringify({ comments: [] }) },
      { match: '^gh pr view 7 --json state', out: JSON.stringify({ state: 'OPEN' }) },
      OHNE_ANTRAG, { match: '^gh pr view 7 ', out: alt(minuten) }, ...SCHREIBEND],
  })
  const erst = bau(400, '[]', [])
  const marke = erst.gh.find((zeile) => zeile.startsWith('gh issue create')).match(/<!-- jules-tor:melder:\w+ -->/)[0]
  const zweit = bau(430, JSON.stringify([{ number: 5 }]), [{ body: marke }])
  check('Der Melder schreibt bei geaenderter Frist nicht erneut ins Sammel-Issue', zahl(zweit.gh, '^gh issue (comment|create)') === 0, kurz(zweit.gh, '^gh issue'))
}

function checkMenschLauf(text) {
  const mensch = lauf(text, {
    github: PREREIGNIS(21),
    gh: [OHNE_ANTRAG, { match: '^gh pr view 21 ', out: JSON.stringify({ title: 'Fix typo', body: 'Ein kleiner Tippfehler.', author: { login: 'vannon091118' }, headRefName: 'fix/typo', labels: [], createdAt: iso(5), additions: 1, deletions: 1, files: [{ path: 'README.md' }], statusCheckRollup: [{ conclusion: 'SUCCESS' }] }) }, ...SCHREIBEND],
  })
  check('Ausgefuehrt: ein menschlicher Antrag loest keinen Schreibzugriff aus', mensch.jobs.route.outputs.jules === 'false' && zahl(mensch.gh, '^gh (pr merge|pr close|pr comment|pr edit|issue)') === 0, kurz(mensch.gh))
  check('Ausgefuehrt: der menschliche Antrag erzeugt weder Merge noch Meldung', mensch.jobs.route.outputs.merges === '[]' && mensch.jobs.route.outputs.blocked === '[]')
}

export function checkJulesLauf() {
  section('Das Jules-Tor als Ausfuehrungsgraph')
  const text = readFileSync(WORKFLOW, 'utf8')
  checkMergeLauf(text)
  checkLeiterLauf(text)
  checkWeckerLauf(text)
  checkRandlauf(text)
  checkMenschLauf(text)
  checkChurn(text)
}
