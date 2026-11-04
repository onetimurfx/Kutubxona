const { chromium } = require('playwright')
const BASE = process.env.KX_BASE || 'http://127.0.0.1:4173/Kutubxona/'
const VPS = [[320,640],[360,740],[390,844],[768,1024],[1024,768],[1440,900]]
const ROUTES = ['/', '/search', '/search?q=sapiens', '/book/sapiens', '/favorites', '/cart', '/order', '/account', '/stationery', '/stationery/daftar-96', '/print', '/admin', '/admin/books', '/admin/stationery', '/admin/orders', '/admin/print', '/admin/inventory', '/admin/data']
;(async () => {
  const b = await chromium.launch(); const issues = []
  for (const [w, h] of VPS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } })
    await ctx.addInitScript(() => { try { sessionStorage.setItem('kx:intro-seen', '1'); sessionStorage.setItem('kx:admin-ok', '1') } catch {} })
    const p = await ctx.newPage(); const errs = []
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)))
    for (const r of ROUTES) {
      await p.goto(BASE + '#' + r); await p.waitForTimeout(350)
      const res = await p.evaluate(() => {
        const out = {}
        out.overflow = document.documentElement.scrollWidth - innerWidth
        out.noAlt = [...document.querySelectorAll('img:not([alt])')].length
        out.unnamed = [...document.querySelectorAll('button,a[href],input,select,textarea')].filter(e => { const s = getComputedStyle(e); if (s.display==='none'||s.visibility==='hidden'||e.type==='hidden'||e.classList.contains('sr-only')) return false; const n = (e.getAttribute('aria-label')||e.innerText||e.value||e.placeholder||e.title||'').trim() || (e.labels&&e.labels.length) || e.getAttribute('aria-labelledby'); return !n }).map(e => e.outerHTML.slice(0, 90))
        out.small = [...document.querySelectorAll('button,a[href]')].filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width>0 && s.visibility!=='hidden' && (r.height < 32 || r.width < 32) && !e.closest('p,li > span') && !(e.tagName==='A' && getComputedStyle(e).display==='inline') }).map(e => (e.getAttribute('aria-label')||e.innerText||'?').trim().slice(0,30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))
        out.h1 = document.querySelectorAll('h1').length
        out.clipped = [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 2 && r.width > 0 && !e.closest('.rail,[class*=overflow-x],table,details') }).length
        return out
      })
      const tag = `${w}px ${r}`
      if (res.overflow > 1) issues.push(`OVERFLOW ${tag} +${res.overflow}`)
      if (res.noAlt) issues.push(`NOALT ${tag} ${res.noAlt}`)
      if (res.unnamed.length) issues.push(`UNNAMED ${tag} ${res.unnamed.join(' | ')}`)
      if (res.small.length) issues.push(`SMALL ${tag} ${[...new Set(res.small)].slice(0,4).join(', ')}`)
      if (res.h1 !== 1) issues.push(`H1x${res.h1} ${tag}`)
      if (res.clipped) issues.push(`CLIPPED ${tag} ${res.clipped}`)
    }
    if (errs.length) issues.push(`ERRORS ${w}px ${[...new Set(errs)].slice(0,3)}`)
    await ctx.close()
  }
  console.log(issues.length ? issues.join('\n') : 'no issues'); await b.close()
})()
