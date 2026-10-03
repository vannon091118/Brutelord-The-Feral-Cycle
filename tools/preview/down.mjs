import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
try { rmSync(resolve(import.meta.dirname, '../../.preview-profile/wants-open')) } catch {}
console.log('Fenster-Schliessen angekuendigt — der Supervisor raeumt auf')
