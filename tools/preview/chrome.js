import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const URL_TO_OPEN = process.argv[2] ?? 'http://127.0.0.1:5173'
const PORT = process.env.CDP_PORT ?? '9222'
const PROFILE = resolve(import.meta.dirname, '../../.preview-profile')
mkdirSync(PROFILE, { recursive: true })

const child = spawn('google-chrome', [
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + PROFILE,
  '--no-first-run', '--no-default-browser-check',
  '--ozone-platform-hint=auto',
  '--window-size=1440,900', '--window-position=0,0',
  '--disable-features=Translate,MediaRouter',
  URL_TO_OPEN,
], { detached: true, stdio: 'ignore' })
child.unref()
process.exit(0)
