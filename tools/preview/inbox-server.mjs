import { createServer } from 'node:http'
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = Number(process.env.INBOX_PORT ?? 9333)
const FILE = resolve(import.meta.dirname, 'inbox.json')
const LOG = resolve(import.meta.dirname, 'daemon.log')
const say = (m) => {
  const line = new Date().toISOString().slice(11, 19) + '  ' + m
  console.log(line)
  try { appendFileSync(LOG, line + '\n') } catch {}
}

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') return res.writeHead(204).end()
  if (req.method === 'GET') {
    const body = read()
    res.writeHead(200, { 'content-type': 'application/json' })
    return res.end(JSON.stringify(body))
  }
  if (req.method === 'DELETE') {
    writeFileSync(FILE, JSON.stringify({ payload: '', comments: [], sentAt: null }))
    say('Inbox geleert')
    res.writeHead(204)
    return res.end()
  }
  if (req.method !== 'POST') { res.writeHead(405); return res.end() }
  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', () => {
    const parsed = safe(body)
    const comments = (parsed.marks ?? []).map((m) => ({ id: m.id, label: m.label, comment: parsed.comments?.[m.id] ?? '' }))
    writeFileSync(FILE, JSON.stringify({ payload: parsed.text ?? '', comments, sentAt: new Date().toISOString() }, null, 2))
    say('Inbox: ' + comments.length + ' Mark(s) von "'
      + (req.headers.origin ?? req.headers.referer ?? 'unbekannt') + '" uebernommen')
    res.writeHead(201, { 'content-type': 'application/json' })
    res.end('{"ok":true}')
  })
})

const safe = (b) => { try { return JSON.parse(b) } catch { return {} } }
const read = () => { try { return safe(readFileSync(FILE, 'utf8')) } catch { return {} } }

server.listen(PORT, '127.0.0.1', () => say('Inbox lauscht auf 127.0.0.1:' + PORT))
