import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, openSync, readFileSync, writeFileSync, appendFileSync, rmSync } from 'node:fs'
import { connect } from 'node:net'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const HERE = import.meta.dirname
const PROFILE = resolve(ROOT, '.preview-profile')
const LOCK = resolve(PROFILE, 'supervisor.pid')
const WANTS = resolve(PROFILE, 'wants-open')
const URL_TO_OPEN = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5173'
const CDP_PORT = Number(process.env.CDP_PORT ?? 9222)
const INBOX_PORT = Number(process.env.INBOX_PORT ?? 9333)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const say = (m) => {
  const line = new Date().toISOString().slice(11, 19) + '  ' + m
  console.log(line)
  try { appendFileSync(resolve(HERE, 'daemon.log'), line + '\n') } catch {}
}

mkdirSync(PROFILE, { recursive: true })
const owner = (() => {
  try {
    const pid = readFileSync(LOCK, 'utf8').trim()
    process.kill(Number(pid), 0)
    return pid
  } catch { return null }
})()
if (owner && owner !== String(process.pid)) {
  console.log('Supervisor laeuft bereits, pid ' + owner + ' — nichts getan')
  process.exit(0)
}
writeFileSync(LOCK, String(process.pid))
writeFileSync(WANTS, '1')

const start = (name, script, args = []) => {
  const out = openSync(resolve(PROFILE, name + '.log'), 'a')
  const child = spawn(process.execPath, [script, ...args], { detached: true, stdio: ['ignore', out, out], cwd: HERE })
  child.unref()
  say(name + ' gestartet, pid ' + child.pid)
}

const wanted = () => { try { return readFileSync(WANTS, 'utf8').trim() === '1' } catch { return false } }

// TCP statt HTTP: undici haelt Keep-Alive-Sockets, die Chrome nach kurzer Zeit
// schliesst. Der naechste fetch landet auf einem toten Socket und meldet
// "Chrome tot", obwohl curl 200 sagt. Ein Connect kann das nicht.
const portOpen = (port) => new Promise((ok) => {
  const socket = connect({ port, host: '127.0.0.1' })
  const done = (v) => { socket.destroy(); ok(v) }
  socket.setTimeout(1200, () => done(false))
  socket.once('connect', () => done(true))
  socket.once('error', () => done(false))
})

const chromeCount = () => {
  try {
    return execFileSync('pgrep', ['-f', 'remote-debugging-port=' + CDP_PORT], { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean).length
  } catch { return 0 }
}

const shutdown = (grund) => {
  say(grund + ' — Supervisor beendet')
  for (const pat of ['tools/preview/up.mjs', 'tools/preview/daemon.mjs', 'tools/preview/inbox-server.mjs']) {
    try { execFileSync('pkill', ['-f', pat]) } catch {}
  }
  try { rmSync(LOCK) } catch {}
  try { rmSync(WANTS) } catch {}
  process.exit(0)
}

writeFileSync(resolve(HERE, 'inbox.json'), JSON.stringify({ payload: '', comments: [], sentAt: null }))
if (!(await portOpen(CDP_PORT))) start('chrome', resolve(HERE, 'chrome.js'), [URL_TO_OPEN])
if (!(await portOpen(INBOX_PORT))) start('inbox', resolve(HERE, 'inbox-server.mjs'))
start('marker', resolve(HERE, 'daemon.mjs'))
say('Supervisor laeuft, pid ' + process.pid)

let misses = 0
let gone = 0
for (;;) {
  await sleep(5000)
  if (!wanted()) shutdown('down.mjs wurde aufgerufen')

  if (await portOpen(CDP_PORT)) { misses = 0; gone = 0; continue }

  misses++
  gone++
  // Fenster zu und kein Chrome-Prozess mehr: das war Absicht, kein Absturz.
  if (chromeCount() === 0 && gone >= 2) shutdown('Fenster wurde geschlossen')

  if (misses < 3) { say('CDP nicht erreichbar (' + misses + '/3)'); continue }
  misses = 0
  if (chromeCount() === 0) {
    say('Chrome-Prozess weg — Port war zu, Fenster kommt')
    start('chrome', resolve(HERE, 'chrome.js'), [URL_TO_OPEN])
    await sleep(8000)
  } else {
    say('Chrome laeuft noch, nur Port zu — kein zweites Fenster')
  }
}
