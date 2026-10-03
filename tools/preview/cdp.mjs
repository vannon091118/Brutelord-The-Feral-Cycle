const HOST = process.env.CDP_HOST ?? '127.0.0.1'
const PORT = process.env.CDP_PORT ?? '9222'

export async function session({ match = '' } = {}) {
  const list = await (await fetch('http://' + HOST + ':' + PORT + '/json/list')).json()
  const tab = list.find((t) => t.type === 'page' && (!match || t.url.includes(match)))
  if (!tab) throw new Error('kein Tab fuer ' + JSON.stringify(match))
  return openSocket(tab.webSocketDebuggerUrl)
}

export function openSocket(url) {
  const ws = new WebSocket(url)
  const ready = new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = () => fail(new Error('CDP-WebSocket zu')) })
  let id = 0
  const pending = new Map()
  const listeners = new Set()
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id)
      pending.delete(m.id)
      m.error ? p.fail(new Error(m.error.message)) : p.ok(m.result)
      return
    }
    for (const fn of listeners) fn(m)
  }
  const send = (method, params = {}) => ready.then(() => new Promise((ok, fail) => {
    const mid = ++id
    pending.set(mid, { ok, fail })
    ws.send(JSON.stringify({ id: mid, method, params }))
  }))
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
    return r.result.value
  }
  return { send, on, evaluate, target: { url: url }, close: () => ws.close() }
}
