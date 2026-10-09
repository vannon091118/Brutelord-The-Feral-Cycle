/** Faehrt `jules-guard.yml` als Ausfuehrungsgraph: Ausdruecke wie beim Runner,
 *  Jobs nach `if`, Bash-Rumpfe mit doppelten `gh` und `git`. Was dieses Geruest
 *  nicht kennt, ist ein Fehler — keine stille Annahme. */
import { spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const WURZEL = decodeURIComponent(new URL('../..', import.meta.url).pathname)

const DOPPEL = (program) => `#!/usr/bin/env node
const { appendFileSync, readFileSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const { EOL } = require('node:os')
const args = process.argv.slice(2)
const zeile = '${program} ' + args.join(' ')
appendFileSync(process.env.${program.toUpperCase()}_LOG, JSON.stringify(zeile) + EOL)
const rezepte = JSON.parse(readFileSync(process.env.${program.toUpperCase()}_RULES, 'utf8'))
for (const rezept of rezepte) {
  if (!new RegExp(rezept.match).test(zeile)) continue
  let aus = rezept.out ?? ''
  const stelle = args.indexOf('--jq')
  if (stelle !== -1 && rezept.jq !== false) {
    const lauf = spawnSync('jq', ['-r', args[stelle + 1]], { input: aus, encoding: 'utf8' })
    if (lauf.status !== 0) { process.stderr.write(lauf.stderr ?? ''); process.exit(2) }
    aus = lauf.stdout
  }
  process.stdout.write(aus)
  process.exit(rezept.code ?? 0)
}
process.stderr.write('${program}-Doppel ohne Rezept: ' + zeile + '\\n')
process.exit(9)
`

function indentOf(line) {
  return line.length - line.trimStart().length
}

function readMap(lines, index, indent) {
  const map = {}
  let i = index
  while (i < lines.length && lines[i].trim() !== '' && indentOf(lines[i]) === indent) {
    const spalte = lines[i].trim().indexOf(':')
    map[lines[i].trim().slice(0, spalte)] = lines[i].trim().slice(spalte + 1).trim()
    i += 1
  }
  return { map, next: i }
}

function collectBlock(lines, index, indent) {
  const out = []
  let i = index
  while (i < lines.length && (lines[i].trim() === '' || indentOf(lines[i]) >= indent)) {
    out.push(lines[i].slice(indent))
    i += 1
  }
  return { text: out.join('\n'), next: i }
}

function parseStep(lines, index) {
  const spalte = lines[index].trim().slice(2)
  const trenner = spalte.indexOf(':')
  const step = { env: {}, [spalte.slice(0, trenner)]: spalte.slice(trenner + 1).trim() }
  let i = index + 1
  while (i < lines.length && (lines[i].trim() === '' || indentOf(lines[i]) >= 8)) {
    const inhalt = lines[i].trim()
    if (inhalt !== '') {
      const trenner2 = inhalt.indexOf(':')
      const key = inhalt.slice(0, trenner2)
      const value = inhalt.slice(trenner2 + 1).trim()
      if (value === '|') {
        const block = collectBlock(lines, i + 1, 10)
        step[key] = block.text
        i = block.next
        continue
      }
      if (key === 'env') {
        const gelesen = readMap(lines, i + 1, 10)
        Object.assign(step.env, gelesen.map)
        i = gelesen.next
        continue
      }
      step[key] = value
    }
    i += 1
  }
  return { step, next: i }
}

function parseNeeds(text) {
  if (text === undefined || text === '') return []
  return text.replace(/^\[|\]$/g, '').split(',').map((teil) => teil.trim()).filter(Boolean)
}

// Der Runner wartet auf `needs`, nicht auf die Reihenfolge in der Datei.
function orderJobs(jobs) {
  const fertig = new Set()
  const reihe = []
  const offen = Object.entries(jobs)
  while (offen.length > 0) {
    const stelle = offen.findIndex(([, job]) => job.needs.every((name) => fertig.has(name)))
    if (stelle === -1) throw new Error('Zyklus oder unbekanntes needs: ' + offen.map(([name]) => name).join(', '))
    const [name, job] = offen.splice(stelle, 1)[0]
    fertig.add(name)
    reihe.push([name, job])
  }
  return reihe
}

function parseWorkflow(text) {
  const lines = text.split('\n')
  const jobs = {}
  let job = null
  for (let i = lines.indexOf('jobs:') + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue
    const indent = indentOf(lines[i])
    if (indent === 2 && /^[\w-]+:$/.test(trimmed)) {
      job = trimmed.replace(/:$/, '')
      jobs[job] = { name: job, if: null, needs: [], outputs: {}, steps: [] }
      continue
    }
    if (job === null) continue
    if (indent === 4 && trimmed.startsWith('needs:')) jobs[job].needs = parseNeeds(trimmed.slice(6).trim())
    if (indent === 4 && trimmed.startsWith('if:')) jobs[job].if = trimmed.slice(3).trim()
    if (indent === 4 && trimmed === 'outputs:') jobs[job].outputs = readMap(lines, i + 1, 6).map
    if (indent === 4 && trimmed === 'steps:') {
      let lauf = i + 1
      while (lauf < lines.length && lines[lauf].trimStart().startsWith('- ') && indentOf(lines[lauf]) === 6) {
        const gelesen = parseStep(lines, lauf)
        jobs[job].steps.push(gelesen.step)
        lauf = gelesen.next
      }
    }
  }
  return jobs
}

function resolve(ctx, pfad) {
  return pfad.split('.').reduce((wert, teil) => (wert === null || wert === undefined ? undefined : wert[teil]), ctx)
}

function hole(z) {
  if (z.pos >= z.tokens.length) throw new Error(`unerwartetes Ende in: ${z.expr}`)
  return z.tokens[z.pos++]
}

function erwarte(z, token) {
  if (hole(z) !== token) throw new Error(`${token} erwartet in: ${z.expr}`)
}

function atom(z) {
  const token = hole(z)
  if (token === '(') {
    const wert = oder(z)
    erwarte(z, ')')
    return wert
  }
  if (token === 'true' || token === 'false') return token === 'true'
  if (token.startsWith("'")) {
    if (!token.endsWith("'") || token.length < 2) throw new Error(`unbekanntes Literal: ${token}`)
    return token.slice(1, -1)
  }
  const wurzel = token.split('.')[0]
  if (!['github', 'needs', 'steps', 'env', 'secrets', 'vars'].includes(wurzel)) {
    throw new Error(`unbekannter Ausdruck: ${token}`)
  }
  const wert = resolve(z.ctx, token)
  return wert === undefined ? '' : wert
}

function vergleich(z) {
  const links = atom(z)
  const op = z.tokens[z.pos]
  if (op !== '==' && op !== '!=') return links
  z.pos += 1
  const rechts = atom(z)
  return op === '==' ? String(links ?? '') === String(rechts ?? '') : String(links ?? '') !== String(rechts ?? '')
}

function und(z) {
  let wert = vergleich(z)
  while (z.tokens[z.pos] === '&&') {
    z.pos += 1
    wert = vergleich(z) && wert
  }
  return wert
}

function oder(z) {
  let wert = und(z)
  while (z.tokens[z.pos] === '||') {
    z.pos += 1
    wert = und(z) || wert
  }
  return wert
}

function evaluator(expr) {
  const z = {
    tokens: expr
      .replace(/\b(always|success)\(\)/g, 'true')
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(Boolean),
    pos: 0,
    ctx: null,
    expr,
  }
  return {
    lauf: (ctx) => {
      z.ctx = ctx
      const wert = oder(z)
      if (z.pos !== z.tokens.length) throw new Error(`Rest in: ${expr}`)
      return wert
    },
  }
}

export function evaluate(expr, ctx) {
  if (expr === null || expr === '') return true
  return Boolean(evaluator(String(expr)).lauf(ctx))
}

export function interpolate(text, ctx) {
  return String(text).replace(/\$\{\{([^}]*)\}\}/g, (_, expr) => {
    const wert = evaluator(expr.trim()).lauf(ctx)
    return String(wert ?? '')
  })
}

function startEnv(dir) {
  return {
    PATH: `${join(dir, 'bin')}:${process.env.PATH}`,
    HOME: dir,
    RUNNER_TEMP: join(dir, 'temp'),
    GITHUB_OUTPUT: join(dir, 'output.txt'),
    GITHUB_STEP_SUMMARY: join(dir, 'summary.md'),
    GH_TOKEN: 'tor-token',
    GH_LOG: join(dir, 'gh.log'),
    GH_RULES: join(dir, 'gh.json'),
    GIT_LOG: join(dir, 'git.log'),
    GIT_RULES: join(dir, 'git.json'),
  }
}

// Ein Job gibt weiter, was sein `outputs:`-Mapping nennt, nicht was in GITHUB_OUTPUT steht.
function jobOutputs(job, ctx, schritte) {
  const umgebung = { ...ctx, steps: schritte }
  return Object.fromEntries(Object.entries(job.outputs).map(([name, ausdruck]) => [name, interpolate(ausdruck, umgebung)]))
}

function runJob(job, ctx, dir) {
  if (!evaluate(job.if, ctx)) return { ran: false, steps: [], outputs: {}, failed: false }
  const env = startEnv(dir)
  writeFileSync(join(dir, 'output.txt'), '')
  const steps = []
  const schritte = {}
  let failed = false
  for (const step of job.steps) {
    if (step.run === undefined) continue
    const datei = join(dir, 'step.sh')
    writeFileSync(datei, interpolate(step.run, ctx))
    const umgebung = { ...env }
    for (const [key, value] of Object.entries(step.env)) umgebung[key] = interpolate(value, ctx)
    const lauf = spawnSync('bash', ['--noprofile', '--norc', datei], { env: umgebung, cwd: WURZEL, encoding: 'utf8' })
    steps.push({ name: step.name, code: lauf.status, stderr: lauf.stderr, stdout: lauf.stdout })
    if (step.id) schritte[step.id] = { outputs: readOutputs(join(dir, 'output.txt')) }
    if (lauf.status !== 0) {
      failed = true
      break
    }
  }
  return { ran: true, failed, steps, outputs: jobOutputs(job, ctx, schritte) }
}

export function readCalls(file) {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((zeile) => JSON.parse(zeile))
}

export function readOutputs(file) {
  const out = {}
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trenner = line.indexOf('=')
    if (line.trim() !== '' && trenner > 0) out[line.slice(0, trenner)] = line.slice(trenner + 1)
  }
  return out
}

export function runWorkflow({ text, github = {}, gh = [], git = [] }) {
  const dir = mkdtempSync(join(tmpdir(), 'jules-tor-'))
  mkdirSync(join(dir, 'bin'))
  mkdirSync(join(dir, 'temp'))
  writeFileSync(join(dir, 'gh.json'), JSON.stringify(gh))
  writeFileSync(join(dir, 'git.json'), JSON.stringify(git))
  writeFileSync(join(dir, 'gh.log'), '')
  writeFileSync(join(dir, 'git.log'), '')
  for (const program of ['gh', 'git']) {
    writeFileSync(join(dir, 'bin', program), DOPPEL(program))
    chmodSync(join(dir, 'bin', program), 0o755)
  }
  const ctx = { github, needs: {}, steps: {}, env: {}, secrets: { GITHUB_TOKEN: 'tor-token' } }
  const jobs = parseWorkflow(text)
  const ergebnis = {}
  for (const [name, job] of orderJobs(jobs)) {
    const lauf = runJob(job, ctx, dir)
    ergebnis[name] = lauf
    ctx.needs[name] = { outputs: lauf.outputs }
  }
  return {
    dir,
    jobs: ergebnis,
    gh: readCalls(join(dir, 'gh.log')),
    git: readCalls(join(dir, 'git.log')),
  }
}
