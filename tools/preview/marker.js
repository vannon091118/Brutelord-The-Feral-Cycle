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

  const button = (txt, cls, onClick) => {
    const b = mk('__mk_btn ' + cls, txt)
    b.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); onClick() })
    return b
  }

  const buildPanel = () => {
    const p = mk('__mk_panel')
    p.id = '__mk_panel'
    p.style.cssText = 'position:fixed;left:12px;top:12px;width:340px;max-height:70vh;display:none;flex-direction:column;background:rgba(16,16,20,.94);border:1px solid #33323a;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.55);font:12px/1.5 ui-monospace,monospace;color:#d8dee9;z-index:2147483647;pointer-events:auto;overflow:hidden'
    head = mk('__mk_head', 'MARKS 0')
    head.style.cssText = 'padding:8px 10px;border-bottom:1px solid #2b2b33;font-weight:700;letter-spacing:.08em;color:#ffb3cd;display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none'
    list = mk('__mk_list')
    list.style.cssText = 'overflow-y:auto;padding:4px 0;flex:1;min-height:24px'
    const foot = mk('__mk_foot')
    foot.style.cssText = 'padding:8px;border-top:1px solid #2b2b33;display:flex;gap:6px;flex-wrap:wrap'
    foot.append(
      button('Senden -> Chat', '__mk_send', send),
      button('Leeren', '', clearAll),
      button('Panel', '', togglePanel),
    )
    for (const b of foot.querySelectorAll('.__mk_btn')) b.style.cssText = 'pointer-events:auto;cursor:pointer;border:1px solid #45424c;background:#241d24;color:#ffb3cd;border-radius:6px;padding:5px 9px;font:11px/1.4 ui-monospace,monospace'
    p.append(head, list, foot)
    makeDraggable(head, p)
    return p
  }

  const makeDraggable = (handle, node) => {
    let ox = 0, oy = 0, dragging = false
    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return
      dragging = true
      const r = node.getBoundingClientRect()
      ox = e.clientX - r.left
      oy = e.clientY - r.top
    })
    addEventListener('mousemove', (e) => {
      if (!dragging) return
      node.style.left = Math.max(0, Math.min(innerWidth - 120, e.clientX - ox)) + 'px'
      node.style.top = Math.max(0, Math.min(innerHeight - 60, e.clientY - oy)) + 'px'
      node.style.right = 'auto'
    })
    addEventListener('mouseup', () => { dragging = false })
  }

  const payload = () => {
    const comments = store.comments()
    const lines = store.marks().map((m) => {
      const c = (comments[m.id] || '').trim()
      const r = m.rect
      const head = '- **' + m.id + '**  \u203A ' + m.label + '  \u00b7  ' + r.x + ',' + r.y + ' ' + r.w + '\u00d7' + r.h
      return c ? head + '  \u2014  ' + c + '\n  Selector: ' + m.selector : head + '\n  Selector: ' + m.selector
    })
    return lines.join('\n')
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:-9999px'
      host().appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    }
  }

  const send = async () => {
    const marks = store.marks()
    if (!marks.length) return say('Nichts markiert — erst "m" druecken, dann klicken')
    const text = payload()
    const clipped = await copy(text)
    let inbox = false
    try {
      const r = await fetch(INBOX, { method: 'POST', body: JSON.stringify({ text, marks }) })
      inbox = r.ok
    } catch {}
    const n = Object.values(store.comments()).filter((c) => c.trim()).length
    const wohin = [clipped && 'Zwischenablage', inbox && 'Inbox'].filter(Boolean).join(' + ')
    say(wohin + ' — ' + marks.length + ' Mark' + (marks.length > 1 ? 's' : '') + ', ' + n + ' Kommentar' + (n === 1 ? '' : 'e') + '  (Strg+V im Chat)')
  }

  const clearAll = () => {
    store.save([])
    store.saveComments({})
    render()
    say('alle Marks entfernt')
  }

  const togglePanel = () => {
    if (!panel) return
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex'
  }

  const comment = (id, text) => {
    const c = store.comments()
    if (text.trim()) c[id] = text
    else delete c[id]
    store.saveComments(c)
  }

  const highlight = (sel) => {
    const el = resolve(sel)
    if (!el || !focus) return
    const r = rectOf(el)
    Object.assign(focus.style, { display: 'block', left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' })
    clearTimeout(highlight.t)
    highlight.t = setTimeout(() => { focus.style.display = 'none' }, 1400)
  }

  const row = (m) => {
    const r = mk('__mk_row')
    r.style.cssText = 'display:flex;gap:6px;align-items:flex-start;padding:5px 10px;border-bottom:1px solid #23232a;cursor:pointer'
    r.addEventListener('mouseenter', () => highlight(m.selector))
    const dot = mk('__mk_dot', '\u2022')
    dot.style.cssText = 'color:#ff3d7f;font-size:15px;line-height:1.2;width:9px;flex:none;margin-top:1px'
    const id = mk('__mk_id', m.id)
    id.style.cssText = 'background:#ff3d7f;color:#fff;font-weight:700;border-radius:4px;padding:1px 4px;flex:none'
    const meta = mk('__mk_meta')
    meta.style.cssText = 'flex:1;min-width:0;overflow:hidden'
    meta.append(mk('__mk_label', m.label))
    const r2 = mk('__mk_rect', m.rect.x + ',' + m.rect.y + '  ' + m.rect.w + '\u00d7' + m.rect.h)
    r2.style.cssText = 'display:block;color:#6f7c8f;font-size:11px'
    meta.append(r2)
    const del = button('\u00d7', '__mk_del', () => {
      store.save(store.marks().filter((x) => x.id !== m.id))
      const c = store.comments()
      delete c[m.id]
      store.saveComments(c)
      render()
    })
    del.style.cssText = 'pointer-events:auto;cursor:pointer;border:none;background:none;color:#6f7c8f;font-size:15px;line-height:1;padding:0 2px;flex:none'
    del.addEventListener('mouseenter', () => { del.style.color = '#ff3d7f' })
    del.addEventListener('mouseleave', () => { del.style.color = '#6f7c8f' })
    const inp = document.createElement('input')
    inp.className = '__mk_comment'
    inp.id = '__mk_c_' + m.id
    inp.value = store.comments()[m.id] || ''
    inp.placeholder = 'Kommentar ...'
    inp.style.cssText = 'width:100%;box-sizing:border-box;margin-top:3px;background:#0e0e12;border:1px solid #2e2e36;color:#d8dee9;border-radius:4px;padding:3px 5px;font:11px/1.4 inherit;outline:none'
    inp.addEventListener('focus', () => highlight(m.selector))
    inp.addEventListener('input', () => comment(m.id, inp.value))
    inp.addEventListener('click', (e) => e.stopPropagation())
    inp.addEventListener('keydown', (e) => e.stopPropagation())
    const box2 = mk('__mk_rowtext')
    box2.style.cssText = 'flex:1;min-width:0'
    box2.append(meta, inp)
    r.append(dot, id, box2, del)
    return r
  }

  const sync = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      for (const m of store.marks()) {
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
    const caret = keepCaret()
    for (const old of root.querySelectorAll('.__mk_badge')) old.remove()
    const marks = store.marks()
    for (const m of marks) {
      const b = mk('__mk_badge', m.id)
      b.id = '__mk_b_' + m.id
      b.style.cssText = 'position:fixed;background:#ff3d7f;color:#fff;font:bold 11px/1 monospace;padding:4px 5px;border-radius:4px;pointer-events:auto;cursor:pointer;z-index:2147483647;box-shadow:0 0 0 2px rgba(255,61,127,.35)'
      b.title = m.label + '  —  Shift+Klick loescht'
      b.addEventListener('click', (e) => {
        e.stopPropagation()
        if (e.shiftKey) {
          store.save(marks.filter((x) => x.id !== m.id))
          render()
          return
        }
        highlight(m.selector)
        navigator.clipboard?.writeText(m.selector)
      })
      b.addEventListener('mouseenter', () => { if (mode) show(resolve(m.selector)) })
      b.addEventListener('mouseleave', hide)
      root.appendChild(b)
    }
    list.textContent = ''
    if (!marks.length) {
      const empty = mk('__mk_empty', 'Noch nichts markiert.\nTaste "m", dann auf ein Element klicken.')
      empty.style.cssText = 'padding:14px 10px;color:#6f7c8f;white-space:pre-line'
      list.appendChild(empty)
    }
    for (const m of marks) list.appendChild(row(m))
    const n = marks.length
    const c = Object.values(store.comments()).filter((x) => x.trim()).length
    head.textContent = 'MARKS ' + n + (c ? '   \u00b7   ' + c + ' Kommentar' + (c > 1 ? 'e' : '') : '')
    bar.style.display = mode ? 'block' : 'none'
    if (!mode) hide()
    restoreCaret(caret)
    sync()
  }

  // render() baut jede Zeile neu. Ohne das verliert das Kommentar-Feld beim
  // Tippen den Fokus und der Rest des Satzes landet in nichts.
  const keepCaret = () => {
    const el = document.activeElement
    if (!el || el.className !== '__mk_comment') return null
    return { id: el.id, start: el.selectionStart, end: el.selectionEnd }
  }
  const restoreCaret = (c) => {
    if (!c) return
    const el = document.getElementById(c.id)
    if (!el) return
    el.focus()
    el.setSelectionRange(c.start, c.end)
  }

  const add = (el) => {
    const list0 = store.marks()
    const n = list0.length ? Math.max(...list0.map((m) => Number(m.id.slice(1)))) : 0
    list0.push({
      id: 'm' + (n + 1), label: labelOf(el), selector: selectorOf(el),
      text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 200),
      rect: rectOf(el), href: el.closest('a')?.href ?? null,
      url: location.href, ts: new Date().toISOString(),
    })
    store.save(list0)
    render()
    if (panel) panel.style.display = 'flex'
  }

  const setMode = (on) => {
    mode = !!on
    document.documentElement.style.cursor = mode ? 'crosshair' : ''
    render()
  }

  window.__mk = {
    setMode, render, togglePanel, payload, send, highlight,
    mode: () => mode,
    marks: () => store.marks(),
    comments: () => store.comments(),
    comment,
    rectOfSelector: (sel) => { const el = resolve(sel); return el ? rectOf(el) : null },
  }

  document.addEventListener('mousemove', (e) => { if (mode) show(e.target) }, true)
  document.addEventListener('click', (e) => {
    if (!mode) return
    const t = e.target
    if (t.closest && t.closest('.__mk_badge, .__mk_panel')) return
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation()
    add(t)
  }, true)
  // Tipp-Pruefung muss VOR jeder Taste stehen: der Handler laeuft in der
  // Capture-Phase, ein Kind kann ihn nicht mehr stoppen. Escape im Kommentar-
  // Feld loest sonst ein render() aus und der Cursor springt ans Zeilenende.
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.target.isContentEditable
    if (typing) {
      if (e.key === 'Escape') { e.target.blur(); e.stopPropagation() }
      return
    }
    if (e.key === 'Escape') { setMode(false); return }
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setMode(!mode) }
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); togglePanel() }
  }, true)
  addEventListener('scroll', sync, true)
  addEventListener('resize', sync)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render)
  else render()
})()
