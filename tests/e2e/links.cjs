/* Crawls every route reachable from the homepage (incl. admin) and fails on HTTP errors, failed requests, broken images or empty pages. */
const { chromium } = require('playwright')
const BASE = process.env.KX_BASE || 'http://127.0.0.1:4173/Kutubxona/'
;(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}})
await c.addInitScript(()=>{try{sessionStorage.setItem('kx:intro-seen','1');sessionStorage.setItem('kx:admin-ok','1')}catch{}})
const p=await c.newPage();const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});p.on('requestfailed',r=>bad.push('FAIL '+r.url()))
const seen=new Set();let q=['/'];const hashes=new Set()
while(q.length){const r=q.shift();if(seen.has(r))continue;seen.add(r)
 await p.goto(BASE+'#'+r);await p.waitForTimeout(350)
 const t=await p.evaluate(()=>({h:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),imgs:[...document.images].filter(i=>i.src&&!i.complete||i.naturalWidth===0&&i.src).map(i=>i.src.slice(0,80)),txt:document.body.innerText.length}))
 if(t.imgs.length)bad.push('BROKEN IMG '+r+' '+t.imgs)
 if(t.txt<30)bad.push('EMPTY '+r)
 for(const h of t.h){if(h.startsWith('#/')){const x=h.slice(1);if(!seen.has(x)&&seen.size+q.length<200)q.push(x)}else if(/^https?:/.test(h)&&!h.includes('127.0.0.1')){hashes.add(h)}}}
console.log('routes visited',seen.size);console.log('external links',[...hashes]);console.log(bad.length?'LINKS FAIL '+JSON.stringify(bad):'LINKS OK: no failed requests / broken images / empty pages');await b.close();process.exit(bad.length?1:0)})()
