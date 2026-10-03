import { writeFileSync } from 'node:fs'
import { session } from './cdp.mjs'

const out = process.argv[2] ?? '/tmp/preview.png'
const s = await session({ match: '127.0.0.1' })
const r = await s.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
writeFileSync(out, Buffer.from(r.data, 'base64'))
console.log(out + '  <-  ' + s.target.url)
s.close()
