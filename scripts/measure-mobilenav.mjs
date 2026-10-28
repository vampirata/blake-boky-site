import { chromium } from 'playwright';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const REF = fileURLToPath(new URL('../docs/reference/', import.meta.url));
const b = await chromium.launch(); const res = {};
for (const [w, h] of [[390, 844], [810, 1100]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  await p.goto('https://blakeandboky.com/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const nav = await p.evaluate(() => { const els = [...document.querySelectorAll('nav, [data-framer-name]')].filter(e => { const r = e.getBoundingClientRect(); return r.top < 10 && r.height > 30 && r.height < 120 && r.width > innerWidth * 0.9; }); return els.map(e => { let f = e, chain = []; while (f && f !== document.body) { chain.push(getComputedStyle(f).position); f = f.parentElement; } const s = getComputedStyle(e); return { name: e.getAttribute('data-framer-name'), tag: e.tagName, h: Math.round(e.getBoundingClientRect().height), bg: s.backgroundColor, backdrop: s.backdropFilter, chain: chain.slice(0, 6).join('>'), html: e.outerHTML.length, kids: [...e.querySelectorAll('[data-framer-name]')].map(k => { const r = k.getBoundingClientRect(); return `${k.getAttribute('data-framer-name')} x${Math.round(r.left)} y${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} cur=${getComputedStyle(k).cursor}`; }).slice(0, 15) }; }); });
  res[w] = { nav };
  // scroll check
  await p.mouse.move(200, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(100); } await p.waitForTimeout(800);
  res[w].afterScroll = await p.evaluate(() => [...document.querySelectorAll('nav')].map(n => ({ top: Math.round(n.getBoundingClientRect().top), name: n.getAttribute('data-framer-name') })));
  await p.mouse.wheel(0, -2000); await p.waitForTimeout(1200);
  // find hamburger: pointer element at right side of top bar
  const t = await p.evaluate(() => { const c = [...document.querySelectorAll('nav *')].filter(e => { const r = e.getBoundingClientRect(); return getComputedStyle(e).cursor === 'pointer' && r.top < 80 && r.left > innerWidth * 0.6 && r.width > 15 && r.width < 120; }).map(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, name: e.getAttribute('data-framer-name'), w: r.width, text: e.textContent.trim().slice(0, 15) }; }); return c; });
  res[w].candidates = t;
  const tgt = t.find(c => !c.text) || t[t.length - 1];
  if (tgt) {
    await p.mouse.click(tgt.x, tgt.y); const samples = [];
    for (let i = 0; i < 8; i++) { await p.waitForTimeout(90); samples.push(await p.evaluate(() => document.getAnimations().map(a => { const t = a.effect?.getTiming?.(); let kf = []; try { kf = a.effect.getKeyframes().map(k => { const { composite, computedOffset, offset, easing, ...o } = k; return o; }); } catch {} return JSON.stringify({ t: a.effect?.target?.getAttribute?.('data-framer-name') || a.effect?.target?.tagName, d: t?.duration, dl: t?.delay, e: (t?.easing || '').slice(0, 50), kf }); }))); }
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${REF}screens/menu-open-${w}.png` });
    res[w].anims = [...new Set(samples.flat())].slice(0, 25).map(s => JSON.parse(s));
    res[w].open = await p.evaluate(() => { const n = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().height > 0); const s = getComputedStyle(n); return { name: n.getAttribute('data-framer-name'), h: Math.round(n.getBoundingClientRect().height), bg: s.backgroundColor, backdrop: s.backdropFilter, items: [...n.querySelectorAll('a')].filter(a => a.getBoundingClientRect().height > 0).map(a => { const r = a.getBoundingClientRect(); const ts = getComputedStyle(a.querySelector('p') || a); return { text: a.textContent.trim().slice(0, 25), y: Math.round(r.top), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), font: ts.fontFamily.split(',')[0], size: ts.fontSize, lh: ts.lineHeight, color: ts.color, ls: ts.letterSpacing }; }) }; });
  }
  await ctx.close();
}
fs.writeFileSync(`${REF}layout/_mobilenav.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1).slice(0, 7000));
await b.close();
