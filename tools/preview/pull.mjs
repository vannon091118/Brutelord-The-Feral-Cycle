import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FILE = resolve(import.meta.dirname, 'inbox.json')
const args = process.argv.slice(2)

if (args.includes('--clear')) {
  await fetch('http://127.0.0.1:' + (process.env.INBOX_PORT ?? 9333) + '/inbox', { method: 'DELETE' })
  console.log('Inbox geleert')
} else {
  let data = { payload: '', comments: [] }
  try { data = JSON.parse(readFileSync(FILE, 'utf8')) } catch {}
  if (!data.sentAt) console.log('Inbox leer — im Fenster "Senden -> Chat" klicken')
  else {
    console.log('gesendet ' + data.sentAt + ', ' + data.comments.length + ' Mark(s)')
    console.log('---')
    console.log(data.payload)
  }
}
