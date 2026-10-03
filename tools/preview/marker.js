(() => {
  if (window.__mk) return
  const KEY = '__mk.marks'
  const store = {
    read: () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } },
    write: (m) => localStorage.setItem(KEY, JSON.stringify(m)),
  }
  const esc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, ''))
  const mk = (cls, txt) => {
    const d = document.createElement('div')
    d.className = cls
    if (txt) d.textContent = txt
    return d
  }
  const host = () => document.body || document.documentElement
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
  const resolve = (selector) => {
    try { return document.querySelector(selector) } catch { return null }
  }

  let root = null, box = null, tip = null, bar = null
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
    tip = mk('__mk_tip')
    tip.style.cssText = 'position:fixed;background:#ff3d7f;color:#fff;font:12px/1.5 monospace;padding:2px 6px;border-radius:4px;display:none;max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'
    root.append(box, tip)
    bar = mk('__mk_bar', 'm: Markier-Modus  |  Esc: aus  |  Klick: Element markieren  |  Shift+Klick auf Badge: loeschen')
    bar.id = '__mk_bar'
    bar.style.cssText = 'position:fixed;left:12px;bottom:12px;background:rgba(20,20,24,.86);color:#9fb0c8;font:11px/1.6 monospace;padding:6px 10px;border-radius:6px;z-index:2147483647;display:none;pointer-events:none'
    h.appendChild(bar)
  }

  let mode = false
  let frame = 0
  const sync = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      for (const m of store.read()) {
        const b = document.getElementById('__mk_b_' + m.id)
        if (!b) continue
        const el = resolve(m.selector)
        if (!el) { b.style.display = 'none'; continue }
        const r = rectOf(el)
        b.style.display = 'block'
        b.style.left = r.x + 'px'
        b.style.top = Math.max(0, r.y - 16) + 'px'
      }
    })
  }
  const show = (el) => {
    if (!el || !box) return hide()
    const r = rectOf(el)
    Object.assign(box.style, { display: 'block', left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' })
    Object.assign(tip.style, { display: 'block', left: (r.x + r.w + 8) + 'px', top: Math.max(0, r.y - 4) + 'px' })
    tip.textContent = labelOf(el)
  }
  const hide = () => { if (box) { box.style.display = 'none'; tip.style.display = 'none' } }

  const render = () => {
    mount()
    if (!root) { setTimeout(render, 60); return }
    for (const old of root.querySelectorAll('.__mk_badge')) old.remove()
    for (const m of store.read()) {
      const b = mk('__mk_badge', m.id)
      b.id = '__mk_b_' + m.id
      b.style.cssText = 'position:fixed;background:#ff3d7f;color:#fff;font:bold 11px/1 monospace;padding:4px 5px;border-radius:4px;pointer-events:auto;cursor:pointer;z-index:2147483647;box-shadow:0 0 0 2px rgba(255,61,127,.35)'
      b.title = m.label + '  —  Shift+Klick loescht'
      b.addEventListener('click', (e) => {
        e.stopPropagation()
        if (e.shiftKey) { store.write(store.read().filter((x) => x.id !== m.id)); render(); return }
        navigator.clipboard?.writeText(m.selector)
        b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 260 })
      })
      b.addEventListener('mouseenter', () => { if (mode) show(resolve(m.selector)) })
      b.addEventListener('mouseleave', hide)
      root.appendChild(b)
    }
    bar.style.display = mode ? 'block' : 'none'
    if (!mode) hide()
    sync()
  }
  const add = (el) => {
    const list = store.read()
    const n = list.length ? Math.max(...list.map((m) => Number(m.id.slice(1)))) : 0
    list.push({
      id: 'm' + (n + 1), label: labelOf(el), selector: selectorOf(el),
      text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 200),
      rect: rectOf(el), href: el.closest('a')?.href ?? null,
      url: location.href, ts: new Date().toISOString(),
    })
    store.write(list)
    render()
  }
  const setMode = (on) => {
    mode = !!on
    document.documentElement.style.cursor = mode ? 'crosshair' : ''
    render()
  }

  window.__mk = {
    setMode, render, mode: () => mode,
    marks: () => store.read(),
    rectOfSelector: (sel) => { const el = resolve(sel); return el ? rectOf(el) : null },
  }

  document.addEventListener('mousemove', (e) => { if (mode) show(e.target) }, true)
  document.addEventListener('click', (e) => {
    if (!mode) return
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation()
    if (e.target.closest && e.target.closest('.__mk_badge')) return
    add(e.target)
  }, true)
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.target.isContentEditable
    if (e.key === 'Escape') { setMode(false); return }
    if (typing) return
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setMode(!mode) }
  }, true)
  addEventListener('scroll', sync, true)
  addEventListener('resize', sync)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render)
  else render()
})()
