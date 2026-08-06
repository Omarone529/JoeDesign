import { chromium } from 'playwright'
const OUT = '/private/tmp/claude-501/-Users-omar-Desktop-Lavori-JoeDesign/d391eacb-e8f1-4c61-9f01-78563bde057e/scratchpad'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))
await page.goto('http://localhost:5173/chi-sono', { waitUntil: 'networkidle' })
const group = page.getByRole('group', { name: /sketchbook/i })
await group.scrollIntoViewIfNeeded()
await page.waitForTimeout(2200)
const box = await group.boundingBox()

const startX = box.x + box.width * 0.85
const startY = box.y + box.height * 0.5
await page.mouse.move(startX, startY)
await page.mouse.down()
for (const [label, frac] of [['30', 0.3], ['50', 0.5], ['70', 0.7], ['90', 0.9]]) {
  await page.mouse.move(startX - box.width * frac, startY, { steps: 12 })
  await page.waitForTimeout(80)
  await page.screenshot({ path: `${OUT}/fix-drag-${label}.png`, clip: { x: box.x - 40, y: box.y - 40, width: box.width + 200, height: box.height + 80 } })
}
await page.mouse.up()
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/fix-settled.png`, clip: { x: box.x - 40, y: box.y - 40, width: box.width + 200, height: box.height + 80 } })
console.log('errors:', JSON.stringify(errors, null, 2))
await browser.close()
