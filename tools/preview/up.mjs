import { spawn } from 'node:child_process'
import { mkdirSync, openSync, writeFileSync, appendFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const HERE = import.meta.dirname
const PROFILE = resolve(ROOT, '.preview-profile')
const URL_TO_OPEN = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5173'
const CDP_PORT = process.env.CDP_PORT ?? '9222'
const INBOX_PORT = process.env.INBOX_PORT ?? '9333'
const LOG = resolve(HERE, 'daemon.log')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const say = (m) => {
  const line = new Date().toISOString().slice(11, 19) + '  ' + m
  console.log(line)
  try { appendFileSync(LOG, line + '\n') } catch {}
}

const start = (name, script, args = []) => {
  const out = openSync(resolve(PROFILE, name + '.log'), 'a')
  const child = spawn(process.execPath, [script, ...args], {
    detached: true, stdio: ['ignore', out, out], cwd: HERE,
  })
  child.unref()
  say(name + ' gestartet, pid ' + child.pid)
}

const cdpUp = async () => {
  try { return (await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version')).ok } catch { return false }
}
const inboxUp = async () => {
  try { await fetch('http://127.0.0.1:' + INBOX_PORT + '/inbox'); return true } catch { return false }
}

mkdirSync(PROFILE, { recursive: true })
writeFileSync(resolve(HERE, 'inbox.json'), JSON.stringify({ payload: '', comments: [], sentAt: null }))

if (!(await cdpUp())) start('chrome', resolve(HERE, 'chrome.js'), [URL_TO_OPEN])
if (!(await inboxUp())) start('inbox', resolve(HERE, 'inbox-server.mjs'))
start('marker', resolve(HERE, 'daemon.mjs'))
writeFileSync(resolve(PROFILE, 'supervisor.pid'), String(process.pid))
say('Supervisor laeuft, pid ' + process.pid + ' — Fenster ist persistent')

for (;;) {
  await sleep(4000)
  if (!(await cdpUp())) {
    say('CDP antwortet nicht — Chrome startet neu')
    start('chrome', resolve(HERE, 'chrome.js'), [URL_TO_OPEN])
    await sleep(7000)
  }
  if (!(await inboxUp())) {
    say('Inbox antwortet nicht — Server startet neu')
    start('inbox', resolve(HERE, 'inbox-server.mjs'))
  }
}
