import { readFileSync, appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { session } from './cdp.mjs'

const PORT = process.env.CDP_PORT ?? '9222'
const MARKER = readFileSync(resolve(import.meta.dirname, 'marker.js'), 'utf8')
const LOG = resolve(import.meta.dirname, 'daemon.log')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const say = (m) => {
  const line = new Date().toISOString().slice(11, 19) + '  ' + m
  console.log(line)
  try { appendFileSync(LOG, line + '\n') } catch {}
}

let backoff = 500
for (;;) {
  try {
    const s = await session({ match: '127.0.0.1' })
    await s.send('Page.enable')
    await s.send('Runtime.enable')
    await s.send('Page.addScriptToEvaluateOnNewDocument', { source: MARKER })
    say('Daemon angehaengt — Marker ueberlebt jetzt jeden Reload')
    s.on(async (m) => {
      if (m.method !== 'Page.frameNavigated' && m.method !== 'Page.loadEventFired') return
      if (m.method === 'Page.frameNavigated' && m.params?.frame?.parentId) return
      await sleep(400)
      try { await s.evaluate(MARKER); say('Marker reaktiviert nach ' + m.method) } catch (e) { say('re-inject: ' + e.message) }
    })
    const poll = setInterval(() => {
      s.evaluate('window.__mk ? 1 : 0').then((v) => { if (!v) s.evaluate(MARKER).then(() => say('Marker nachgezogen')).catch(() => {}) }).catch(() => {})
    }, 2000)
    await new Promise(() => {})
    clearInterval(poll)
  } catch (e) {
    say('kein Tab: ' + e.message + ' — neuer Versuch in ' + backoff + 'ms')
    await sleep(backoff)
    backoff = Math.min(backoff * 2, 5000)
    continue
  }
}
