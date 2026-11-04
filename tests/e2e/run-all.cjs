/* Runs every E2E suite against a production preview.
 *   npm run build && npm run test:e2e
 * Requires Playwright with a Chromium browser:  npm i -D playwright && npx playwright install chromium
 * Set KX_BASE to test an already-running site (e.g. the deployed GitHub Pages URL). */
const { spawn, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true })
const external = !!process.env.KX_BASE
let server
const wait = async (url) => {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview server did not start')
}

;(async () => {
  if (!external) {
    server = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], { stdio: 'ignore', cwd: path.join(__dirname, '../..') })
    await wait('http://127.0.0.1:4173/Kutubxona/')
  }
  let failed = 0
  for (const f of ['phase2', 'phase3', 'phase4']) {
    const r = spawnSync('node', [path.join(__dirname, f + '.cjs')], { encoding: 'utf8' })
    const out = r.stdout + r.stderr
    const m = out.match(/(\d+) passed, (\d+) failed/)
    console.log(`${f}: ${m ? m[0] : 'did not finish'}`)
    if (!m || m[2] !== '0') { failed++; console.log(out.split('\n').filter((l) => l.startsWith('FAIL')).join('\n')) }
  }
  const a = spawnSync('node', [path.join(__dirname, 'audit.cjs')], { encoding: 'utf8' })
  const issues = (a.stdout || '').split('\n').filter((l) => /^(OVERFLOW|ERRORS|NOALT|UNNAMED|H1x)/.test(l))
  console.log(`audit (overflow / console errors / alt / names / h1): ${issues.length ? issues.join('\n') : 'clean'}`)
  if (issues.length) failed++
  if (server) server.kill()
  process.exit(failed ? 1 : 0)
})()
