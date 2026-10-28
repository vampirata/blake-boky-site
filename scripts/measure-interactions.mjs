// Interaction probes: nav scroll behaviour, hover diffs, mobile menu, page transition, lightbox/carousel, cursor.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const BASE = 'https://blakeandboky.com';
const REF = fileURLToPath(new URL('../docs/reference/', import.meta.url));
const out = {};
const browser = await chromium.launch();
const anims = () => document.getAnimations().map(a => { const t = a.effect?.getTiming?.(); let kf = []; try { kf = a.effect.getKeyframes().map(k => { const o = { ...k }; delete o.composite; delete o.computedOffset; if (o.easing === 'linear') delete o.easing; return o; }); } catch {} return { target: a.effect?.target?.getAttribute?.('data-framer-name') || a.effect?.target?.tagName, prop: a.transitionProperty, duration: t?.duration, delay: t?.delay, easing: (t?.easing || '').slice(0, 60), kf }; });

async function open(w, h, path) { const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); await p.goto(BASE + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(800); return [ctx, p]; }
async function wheelTo(p, target) { await p.mouse.move(300, 300); for (let i = 0; i < 80; i++) { const y = await p.evaluate(() => scrollY); if (Math.abs(y - target) < 200) break; await p.mouse.wheel(0, y < target ? 250 : -250); await p.waitForTimeout(80); } await p.waitForTimeout(900); }

// 1. nav behaviour
for (const [w, h, path] of [[1440, 900, '/'], [1440, 900, '/collections'], [390, 844, '/'], [810, 1100, '/']]) {
  const [ctx, p] = await open(w, h, path);
  const navState = () => { const fixed = [...document.querySelectorAll('#main *')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 20 && e.getBoundingClientRect().height < 200 && e.getBoundingClientRect().width > innerWidth * 0.8); return { scrollY: Math.round(scrollY), navs: fixed.map(f => { const n = f.querySelector('nav, [data-framer-name]'); const s = getComputedStyle(n || f); const r = (n || f).getBoundingClientRect(); return { name: n?.getAttribute('data-framer-name'), top: Math.round(r.top), h: Math.round(r.height), bg: s.backgroundColor, backdrop: s.backdropFilter, opacity: getComputedStyle(f).opacity, transform: getComputedStyle(f).transform, color: getComputedStyle(n?.querySelector('p, a') || n || f).color }; }) }; };
  const states = [await p.evaluate(navState)];
  for (const y of [400, 1200, 2500]) { await wheelTo(p, y); states.push(await p.evaluate(navState)); }
  await p.mouse.wheel(0, -400); await p.waitForTimeout(800); states.push({ ...(await p.evaluate(navState)), note: 'after scrolling up 400' });
  out[`nav-${w}-${path}`] = states;
  await ctx.close();
}

// 2. hover diffs at 1440
const SNAP = sel => {
  const els = [...document.querySelectorAll(sel)];
  const pick = el => { const s = getComputedStyle(el); return { opacity: s.opacity, transform: s.transform, color: s.color, bg: s.backgroundColor, filter: s.filter, deco: s.textDecorationLine, border: s.borderColor, scale: s.scale, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), cursor: s.cursor }; };
  return els.map(el => [el, ...el.querySelectorAll('*')].slice(0, 40).map((d, i) => ({ i, name: d.getAttribute('data-framer-name') || d.tagName.toLowerCase(), ...pick(d) })));
};
for (const path of ['/', '/collections', '/collections/spirit-collection', '/past-works', '/news', '/galleriespetley', '/blake-bio', '/contact']) {
  const [ctx, p] = await open(1440, 900, path);
  const cands = await p.evaluate(() => { const seen = new Set(); const res = []; let k = 0; for (const el of document.querySelectorAll('#main a, #main button, #main [data-framer-name="Case"], #main [data-highlight]')) { const r = el.getBoundingClientRect(); if (r.width < 10 || r.height < 10) continue; const key = (el.className || '') + '|' + el.tagName + '|' + Math.round(r.width / 20); if (seen.has(key)) continue; seen.add(key); el.setAttribute('data-probe', k); res.push({ k, tag: el.tagName, name: el.getAttribute('data-framer-name') || '', text: el.textContent.trim().slice(0, 40), href: el.getAttribute('href'), w: Math.round(r.width), h: Math.round(r.height), fixed: !!el.closest('[class*="container"]') && getComputedStyle(el.closest('[class*="container"]')).position === 'fixed' }); k++; } return res.slice(0, 30); });
  const results = [];
  for (const c of cands) {
    try {
      const loc = p.locator(`[data-probe="${c.k}"]`);
      await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
      await p.mouse.move(5, 5); await p.waitForTimeout(300);
      const before = await p.evaluate(SNAP, `[data-probe="${c.k}"]`);
      await loc.hover({ timeout: 2000 }); await p.waitForTimeout(150);
      const mid = await p.evaluate(anims);
      await p.waitForTimeout(700);
      const after = await p.evaluate(SNAP, `[data-probe="${c.k}"]`);
      const diffs = [];
      before[0]?.forEach((b, i) => { const a = after[0][i]; if (!a) return; for (const key of Object.keys(b)) if (b[key] !== a[key] && key !== 'i') diffs.push(`${b.name}#${i}.${key}: ${b[key]} -> ${a[key]}`); });
      if (diffs.length) results.push({ ...c, diffs: diffs.slice(0, 15), anims: mid.filter(a => a.duration).slice(0, 6) });
    } catch (e) { results.push({ ...c, err: e.message.split('\n')[0] }); }
  }
  out[`hover-${path}`] = { candidates: cands.length, withEffect: results };
  await ctx.close();
}

// 3. mobile menu at 390 and 810
for (const [w, h] of [[390, 844], [810, 1100]]) {
  const [ctx, p] = await open(w, h, '/');
  const btn = await p.evaluate(() => { const fixed = [...document.querySelectorAll('#main *')].find(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().top < 5 && e.getBoundingClientRect().height > 20 && e.getBoundingClientRect().height < 150); if (!fixed) return null; const c = [...fixed.querySelectorAll('*')].filter(e => getComputedStyle(e).cursor === 'pointer' && e.getBoundingClientRect().width > 10).map(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, name: e.getAttribute('data-framer-name'), w: r.width, h: r.height, text: e.textContent.trim().slice(0, 20) }; }); return { navName: fixed.querySelector('[data-framer-name]')?.getAttribute('data-framer-name'), navH: fixed.getBoundingClientRect().height, clickables: c }; });
  out[`menu-${w}`] = { btn };
  const target = btn?.clickables?.filter(c => !c.text || /menu/i.test(c.text) || /menu|burger|icon/i.test(c.name || '')).sort((a, b) => b.x - a.x)[0];
  if (target) {
    await p.mouse.click(target.x, target.y);
    const samples = [];
    for (let i = 0; i < 6; i++) { await p.waitForTimeout(120); samples.push(await p.evaluate(anims)); }
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${REF}screens/menu-open-${w}.png` });
    const st = await p.evaluate(() => { const fixed = [...document.querySelectorAll('#main *, #overlay *')].filter(e => ['fixed', 'absolute'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 200 && e.getBoundingClientRect().top < 100).map(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return { name: e.getAttribute('data-framer-name'), top: r.top, h: Math.round(r.height), w: Math.round(r.width), bg: s.backgroundColor, backdrop: s.backdropFilter, opacity: s.opacity, transform: s.transform, padding: s.padding, gap: s.gap }; }); const items = [...document.querySelectorAll('#main a, #overlay a')].filter(a => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && r.width > 0; }).map(a => { const s = getComputedStyle(a.querySelector('p,span') || a); const r = a.getBoundingClientRect(); return { text: a.textContent.trim().slice(0, 30), y: Math.round(r.top), x: Math.round(r.left), h: Math.round(r.height), font: s.fontFamily.split(',')[0], size: s.fontSize, color: s.color }; }); return { panels: fixed.slice(0, 8), items }; });
    out[`menu-${w}`] = { btn, clicked: target, anims: samples.flat().filter(a => a.duration).filter((a, i, arr) => arr.findIndex(b => JSON.stringify(b) === JSON.stringify(a)) === i).slice(0, 20), open: st };
  }
  await ctx.close();
}

// 4. page transition + lightbox/carousel + cursor
{
  const [ctx, p] = await open(1440, 900, '/collections');
  const nav0 = p.url();
  const link = p.locator('#main a[href*="collections/"]').first();
  await link.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
  let fullReload = false; p.once('load', () => { fullReload = true; });
  await link.click();
  const samples = []; for (let i = 0; i < 6; i++) { await p.waitForTimeout(100); samples.push(await p.evaluate(anims)); }
  await p.waitForTimeout(1500);
  out.pageTransition = { from: nav0, to: p.url(), fullReload, scrollAfter: await p.evaluate(() => scrollY), anims: samples.flat().filter(a => a.duration).slice(0, 15) };
  await ctx.close();
}
for (const path of ['/collections/spirit-collection/angel-forces', '/past-works/the-story', '/galleriespetley/petley-jones', '/news/sculptures_symbolisiing_hope']) {
  const [ctx, p] = await open(1440, 900, path);
  const info = await p.evaluate(() => ({ slideshows: [...document.querySelectorAll('[data-framer-name]')].filter(e => /slide|carousel|ticker|gallery|lightbox/i.test(e.getAttribute('data-framer-name'))).map(e => e.getAttribute('data-framer-name')).slice(0, 10), arrows: [...document.querySelectorAll('button, [aria-label]')].map(b => b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20)).slice(0, 15), ulLists: [...document.querySelectorAll('#main ul')].map(u => ({ items: u.children.length, w: Math.round(u.getBoundingClientRect().width), scrollW: u.scrollWidth, transform: getComputedStyle(u).transform })).slice(0, 5), cursorEls: [...document.querySelectorAll('[data-framer-cursor], [data-framer-component-type="Cursor"]')].length }));
  const imgs = await p.$$('#main img');
  let lightbox = null;
  for (const im of imgs.slice(0, 6)) {
    const bb = await im.boundingBox(); if (!bb || bb.width < 200) continue;
    await im.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
    const before = await p.evaluate(() => [location.href, document.querySelectorAll('[style*="position: fixed"], #overlay *').length]);
    await im.click({ force: true, timeout: 2000 }).catch(() => {}); await p.waitForTimeout(1200);
    const after = await p.evaluate(() => [location.href, document.querySelectorAll('[style*="position: fixed"], #overlay *').length, document.querySelector('#overlay')?.innerHTML.length || 0]);
    lightbox = { before, after, cursorOnImg: await im.evaluate(e => getComputedStyle(e).cursor) };
    if (after[1] !== before[1] || after[0] !== before[0]) await p.screenshot({ path: `${REF}screens/lightbox-${path.split('/').pop()}-1440.png` });
    break;
  }
  out[`detail-${path}`] = { ...info, lightbox };
  await ctx.close();
}
fs.writeFileSync(`${REF}layout/_interactions.json`, JSON.stringify(out, null, 1));
console.log('done');
await browser.close();
