#!/usr/bin/env node
/** Das Tor als Befehl: Kontext als JSON von stdin, Entscheidung als
 *  `key=value` nach stdout. Die Regel steht in jules-rules.mjs, die Zahlen in
 *  jules-policy.mjs — hier ist nur Ein- und Ausgabe. */
import { readFileSync } from 'node:fs'
import { commitViolations } from '../lib/commit-rules.mjs'
import { automationDecision, checksGreen, decisionLines, julesSignal } from './jules-rules.mjs'

function contextOf() {
  return JSON.parse(readFileSync(0, 'utf8'))
}

// Geprueft werden genau die Bytes, die als Squash-Message committet werden.
export function messageOf(request) {
  return `${request?.title ?? ''}\n\n${request?.body ?? ''}`
}

export function evaluate(context) {
  const request = context.request ?? {}
  const change = context.change ?? {}
  const issues = commitViolations({ sha: 'jules', message: messageOf(request), paths: change.files ?? [] })
  const check = { green: checksGreen(context.checks ?? []), policyOk: issues.length === 0 }
  const signal = julesSignal(request)
  const entschieden = automationDecision({ request, change, check })
  // Ein fremder Antrag ist nicht unser Antrag: das Tor haelt sich heraus.
  const decision = signal.jules
    ? entschieden
    : { ...entschieden, action: 'hold', stage: 'idle', reason: 'kein Jules-Antrag — das Tor haelt sich heraus' }
  return { signal, decision, issues }
}

function main() {
  const { signal, decision, issues } = evaluate(contextOf())
  const zeilen = [
    `jules=${signal.jules}`,
    `via=${signal.via.join(' ') || '-'}`,
    ...decisionLines({ decision, issues }),
  ]
  console.log(zeilen.join('\n'))
}

if (process.argv[1]?.endsWith('jules-guard.mjs')) main()
