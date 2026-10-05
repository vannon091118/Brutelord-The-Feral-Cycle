(() => {
  if (window.__mk) return
  const MKEY = '__mk.marks'
  const CKEY = '__mk.comments'
  const INBOX = 'http://127.0.0.1:9333/inbox'
  const store = {
    marks: () => { try { return JSON.parse(localStorage.getItem(MKEY) || '[]') } catch { return [] } },
    save: (m) => localStorage.setItem(MKEY, JSON.stringify(m)),
    comments: () => { try { return JSON.parse(localStorage.getItem(CKEY) || '{}') } catch { return {} } },
    saveComments: (c) => localStorage.setItem(CKEY, JSON.stringify(c)),
  }
  const esc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, ''))
  const host = () => document.body || document.documentElement
  const mk = (cls, txt) => {
    const d = document.createElement('div')
    d.className = cls
    if (txt) d.textContent = txt
    return d
  }
  const rectOf = (el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }
  const labelOf = (el) => {
    let s = el.tagName.toLowerCase()
    if (el.id) s += '#' + el.id
    const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2) : []
    for (const k of c) if (!k.startsWith('__mk')) s += '.' + k
    return s
  }
  const selectorOf = (el) => {
    if (el.id) return '#' + esc(el.id)
    const parts = []
    let node = el
    while (node && node.nodeType === 1 && parts.length < 6) {
      if (node.id) { parts.unshift('#' + esc(node.id)); break }
      let part = node.tagName.toLowerCase()
      const c = [...node.classList].filter((k) => !k.startsWith('__mk')).slice(0, 2)
      if (c.length) part += '.' + c.map(esc).join('.')
      const parent = node.parentElement
      if (parent) {
        const sibs = [...parent.children].filter((x) => x.tagName === node.tagName)
        if (sibs.length > 1) part += ':nth-of-type(' + (sibs.indexOf(node) + 1) + ')'
      }
      parts.unshift(part)
      node = node.parentElement
    }
    return parts.join(' > ')
  }
  const resolve = (sel) => { try { return document.querySelector(sel) } catch { return null } }

  let root = null, box = null, tip = null, bar = null, panel = null, list = null, head = null, focus = null, toast = null
  let mode = false, frame = 0

  const mount = () => {
    if (root && root.isConnected) return
    const h = host()
    if (!h) return
    root = mk('__mk_root')
    root.id = '__mk_root'
    Object.assign(root.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 2147483646 })
    h.appendChild(root)
    box = mk('__mk_box')
    box.style.cssText = 'position:fixed;border:2px solid #ff3d7f;background:rgba(255,61,127,.14);border-radius:6px;display:none'
    focus = mk('__mk_focus')
    focus.style.cssText = 'position:fixed;border:2px solid #35d0d6;background:rgba(53,208,214,.18);border-radius:6px;display:none;pointer-events:none'
    tip = mk('__mk_tip')
    tip.style.cssText = 'position:fixed;background:#ff3d7f;color:#fff;font:12px/1.5 monospace;padding:2px 6px;border-radius:4px;display:none;max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'
    toast = mk('__mk_toast')
    toast.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#111;border:1px solid #ff3d7f;color:#ffb3cd;font:12px/1.6 monospace;padding:8px 14px;border-radius:8px;z-index:2147483647;display:none;pointer-events:none'
    h.appendChild(toast)
    root.append(box, focus, tip)
    bar = mk('__mk_bar', 'm: Markieren  |  p: Panel  |  Esc: aus  |  Klick: Element markieren  |  Shift+Klick auf Badge: loeschen')
    bar.id = '__mk_bar'
    bar.style.cssText = 'position:fixed;left:12px;bottom:12px;background:rgba(20,20,24,.86);color:#9fb0c8;font:11px/1.6 monospace;padding:6px 10px;border-radius:6px;z-index:2147483647;display:none;pointer-events:none'
    h.appendChild(bar)
    panel = buildPanel()
    h.appendChild(panel)
  }

  const say = (msg) => {
    if (!toast) return
    toast.textContent = msg
    toast.style.display = 'block'
    clearTimeout(say.t)
    say.t = setTimeout(() => { toast.style.display = 'none' }, 4200)
  }

