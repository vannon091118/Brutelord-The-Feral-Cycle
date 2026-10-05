import { spawn } from 'node:child_process'
import { mkdirSync, openSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { session } from './cdp.mjs'

const PORT = process.env.CDP_PORT ?? '9222'
const URL_TO_OPEN = process.argv[2] ?? 'http://127.0.0.1:5173'
const ROOT = resolve(import.meta.dirname, '../..')
const PROFILE = resolve(ROOT, '.preview-profile')
const MARKER = readFileSync(resolve(import.meta.dirname, 'marker-core.js'), 'utf8')
  + '\n' + readFileSync(resolve(import.meta.dirname, 'marker.js'), 'utf8')

const alive = async () => {
  try {
    const r = await fetch('http://127.0.0.1:' + PORT + '/json/version')
    return r.ok
  } catch { return false }
}

const waitForCdp = async () => {
  for (let i = 0; i < 60; i++) {
    if (await alive()) return
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('CDP antwortet nach 30s nicht auf Port ' + PORT)
}

const launch = () => {
  mkdirSync(PROFILE, { recursive: true })
  const log = resolve(ROOT, '.preview-profile/chrome.log')
  const out = openSyncLog(log)
  const child = spawn('google-chrome', [
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + PROFILE,
    '--no-first-run', '--no-default-browser-check',
    '--ozone-platform-hint=auto',
    '--window-size=1440,900', '--window-position=0,0',
    '--disable-features=Translate,MediaRouter',
    URL_TO_OPEN,
  ], { detached: true, stdio: ['ignore', out.fd, out.fd] })
  child.unref()
  writeFileSync(resolve(PROFILE, 'preview.pid'), String(child.pid))
  return child.pid
}

const openSyncLog = (file) => {
  const fd = openSync(file, 'a')
  return { fd }
}

if (!(await alive())) {
  console.log('starte Chrome, pid ' + launch())
} else {
  console.log('Chrome laeuft bereits auf Port ' + PORT)
}
await waitForCdp()

const list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json()
let tab = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1'))
if (!tab) {
  await fetch('http://127.0.0.1:' + PORT + '/json/new?' + encodeURIComponent(URL_TO_OPEN), { method: 'PUT' })
  await new Promise((r) => setTimeout(r, 1500))
}

const s = await session({ match: '127.0.0.1' })
await s.send('Page.enable')
await s.send('Page.addScriptToEvaluateOnNewDocument', { source: MARKER })
await s.evaluate(MARKER)
console.log('Marker injiziert in ' + s.target.url)
s.close()
