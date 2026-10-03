import { session } from './cdp.mjs'

const args = process.argv.slice(2)
const s = await session({ match: '127.0.0.1' })

if (args.includes('--clear')) {
  await s.evaluate('localStorage.removeItem("__mk.marks"); window.__mk.render(); 0')
  console.log('alle Marks entfernt')
} else if (args.includes('--mode')) {
  const on = args[1] === 'on'
  await s.evaluate('window.__mk.setMode(' + on + ')')
  console.log('Markier-Modus ' + (on ? 'AN' : 'AUS'))
} else {
  const marks = await s.evaluate('JSON.stringify(window.__mk.marks())')
  const list = JSON.parse(marks)
  if (!list.length) console.log('keine Marks — im Fenster "m" druecken, dann klicken')
  for (const m of list) {
    console.log(m.id + '  <' + m.label + '>  ' + JSON.stringify(m.rect) + '  ' + m.text.slice(0, 60))
    console.log('    ' + m.selector)
  }
  console.log('--- JSON ---')
  console.log(JSON.stringify(list, null, 2))
}
s.close()
