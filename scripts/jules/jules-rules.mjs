/** Die Entscheidungen des Jules-Tores: Gruppierung, Schwelle, Zweigdeckel und
 *  Eskalationsleiter — reine Funktionen ohne Netz, Git oder Zustand. Jules
 *  erkennt es an Zweigform, Body-Trailer und Task-Nummer, nicht am Autor. */
import { JULES_POLICY } from './jules-policy.mjs'

const PFAD_RE = /\b(?:src|scripts|tools)\/[\w./-]+/g
const PFAD_TEST = /\b(?:src|scripts|tools)\/[\w./-]+/
const BEFEHL_TEST = /\bnpm run\s+[a-z][\w:-]*/
const GRUEN = ['SUCCESS', 'NEUTRAL', 'SKIPPED']
const KOPF_RE = /^\s*\[jules\]\s*/i
const KENNUNG_RE = new RegExp(JULES_POLICY.taskPattern)
const ZWEIG_ENDE_RE = new RegExp(JULES_POLICY.branchTaskSuffix)

export function istJulesZweig(branch = '') {
  const name = String(branch)
  const praefix = JULES_POLICY.branchPrefixes.some((teil) => name.startsWith(teil))
  return praefix || ZWEIG_ENDE_RE.test(name)
}

export function auftragsKennung(text = '') {
  const treffer = String(text).match(KENNUNG_RE)
  return treffer ? treffer[1] : ''
}

export function slugOf(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Dateiliste und Kommata fliegen raus: der Rest ist das Anliegen, nicht die Aufzaehlung.
export function stripDetail(text) {
  return String(text)
    .split(',')[0]
    .replace(KOPF_RE, ' ')
    .replace(PFAD_RE, ' ')
    .trim()
}

export function groupingKeyOf({ issueNumber, title = '', branch = '', body = '' }) {
  const kennung = auftragsKennung(`${title}\n${body}\n${branch}`)
  if (kennung) return `auftrag-${kennung}`
  if (Number.isInteger(issueNumber) && issueNumber > 0) return `issue-${issueNumber}`
  const praefix = JULES_POLICY.branchPrefixes.find((teil) => branch.startsWith(teil)) ?? ''
  return `antrag-${slugOf(stripDetail(branch.slice(praefix.length) || title))}`
}

export function ruleMatchOf({ title = '', body = '', labels = [] }) {
  const text = `${title}\n${body}`.toLowerCase()
  const rule = Object.keys(JULES_POLICY.rules)
    .find((id) => JULES_POLICY.rules[id].some((wort) => text.includes(wort))) ?? null
  const score = [rule !== null, BEFEHL_TEST.test(text), PFAD_TEST.test(text), labels.includes(JULES_POLICY.labels.auftrag)]
    .filter(Boolean).length
  return { rule, score, clear: rule !== null && score >= JULES_POLICY.threshold.minScore }
}

export function isSmall({ files = [], additions = 0, deletions = 0 }) {
  const menge = files.length
  return menge > 0 && menge <= JULES_POLICY.small.maxFiles && additions + deletions <= JULES_POLICY.small.maxLines
}

export function branchCap({ branches = [], cap = JULES_POLICY.maxOpenBranches }) {
  const offen = branches.filter((branch) => istJulesZweig(branch))
  return {
    open: offen.length,
    cap,
    over: offen.length > cap,
    drain: offen.slice(0, Math.max(0, offen.length - cap)),
  }
}

export function escalationStage({ ageMinutes = 0 }) {
  const { watchdogMinutes, issueAfterMinutes, promptAfterMinutes, closeAfterMinutes } = JULES_POLICY.escalation
  if (ageMinutes >= closeAfterMinutes) return 'pr-close'
  if (ageMinutes >= promptAfterMinutes) return 'prompter'
  if (ageMinutes >= issueAfterMinutes) return 'issue-melder'
  if (ageMinutes >= watchdogMinutes) return 'watchdog'
  return 'idle'
}

export function checksGreen(checks = []) {
  return (
    checks.length > 0 &&
    checks.every((entry) => GRUEN.includes(entry?.state ?? entry?.conclusion ?? ''))
  )
}

export function julesSignal({ login = '', branch = '', title = '', body = '', labels = [] }) {
  const spur = `${title}\n${body}`
  const via = []
  if (JULES_POLICY.actors.includes(login)) via.push('autor')
  if (istJulesZweig(branch)) via.push('zweig')
  if (String(title).toLowerCase().includes(JULES_POLICY.titlePrefix.toLowerCase())) via.push('betreff')
  if (labels.includes(JULES_POLICY.labels.auftrag)) via.push('auftrag')
  if (JULES_POLICY.markers.some((marke) => spur.includes(marke)) || auftragsKennung(spur) !== '') via.push('spur')
  return { jules: via.length > 0, via }
}

// Eintrittskarte ist die Regelpassung; kleine gruene Arbeit geht vor den Deckel.
export function automationDecision({ request = {}, change = {}, check = {} }) {
  const group = groupingKeyOf(request)
  const match = ruleMatchOf(request)
  const stage = escalationStage({ ageMinutes: change.ageMinutes ?? 0 })
  const cap = branchCap({ branches: change.branches })
  const basis = { group, stage, rule: match.rule, score: match.score, cap }
  const klein = isSmall(change)
  if (match.clear && klein && check.green === true && check.policyOk === true) {
    return { ...basis, action: 'merge', reason: 'klein, gruen und regelkonform — vor jedem neuen Zweig zusammenfuehren' }
  }
  if (stage === 'pr-close') {
    return { ...basis, action: 'close', reason: `offen seit ${change.ageMinutes ?? 0} Minuten ohne gruenen Nachweis` }
  }
  if (!match.clear) {
    return { ...basis, action: 'reroute', reason: `keine klare Regelpassung (${match.score}/${JULES_POLICY.threshold.minScore})` }
  }
  if (cap.over) {
    return { ...basis, action: 'drain', reason: `${cap.open} offene Zweige ueber dem Deckel ${cap.cap} — erst zusammenfuehren, dann neu anlegen` }
  }
  return {
    ...basis,
    action: 'hold',
    reason: klein ? 'Pruefung laeuft — kein neuer Zweig noetig' : 'innerhalb des Deckels und mit klarer Regelpassung',
  }
}

export function torFlags({ action, stage }) {
  return {
    merge: action === 'merge',
    prompt: action === 'reroute' || stage === 'prompter',
    close: action === 'close',
  }
}

function einzeilig(text) {
  return String(text).replace(/\s+/g, ' ').trim()
}

export function decisionLines({ decision, issues = [] }) {
  const oben = issues[0]
  const flags = torFlags(decision)
  return [
    `action=${decision.action}`,
    `stage=${decision.stage}`,
    `group=${decision.group}`,
    `rule=${decision.rule ?? 'keine'}`,
    `score=${decision.score}`,
    `cap=${decision.cap.open}/${decision.cap.cap}`,
    `drain=${decision.cap.drain.join(' ') || '-'}`,
    `merge=${flags.merge}`,
    `prompt=${flags.prompt}`,
    `close=${flags.close}`,
    `policy=${issues.length === 0 ? 'ok' : issues.length}`,
    `hint=${oben ? einzeilig(`${oben.rule}: ${oben.detail}`) : 'ok'}`,
    `reason=${einzeilig(decision.reason)}`,
  ]
}
