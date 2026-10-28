import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +process.argv[2] || 390, height: 844 } });
await p.goto('https://blakeandboky.com' + (process.argv[3] || '/'), { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const dump = () => p.evaluate(() => { const n = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().width > 0); let f = n; const chain = []; while (f && f !== document.body) { const s = getComputedStyle(f); chain.push(`${f.getAttribute('data-framer-name') || f.tagName}:${s.position}${s.position === 'fixed' || s.position === 'sticky' ? ' top=' + s.top : ''}`); f = f.parentElement; } return { chain, items: [n, ...n.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 40).map(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return `${e.tagName.toLowerCase()}[${e.getAttribute('data-framer-name') || ''}] x${Math.round(r.left)} y${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} bg=${s.backgroundColor} rad=${s.borderRadius} pad=${s.padding} bd=${s.backdropFilter} cur=${s.cursor} op=${s.opacity} tf=${s.transform} font=${s.fontFamily.split(',')[0]} ${s.fontSize} ${s.fontWeight} col=${s.color} txt=${e.children.length ? '' : e.textContent.trim().slice(0, 20)}`; }) }; });
console.log(JSON.stringify(await dump(), null, 1));
const btn = await p.evaluate(() => { const n = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().width > 0); const c = [...n.querySelectorAll('*')].filter(e => getComputedStyle(e).cursor === 'pointer' && !e.closest('a')); const e = c[c.length - 1] || [...n.querySelectorAll('svg, [data-framer-name*="icon" i], [data-framer-name*="menu" i]')].pop(); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, name: e.getAttribute('data-framer-name') }; });
console.log('BTN', btn);
if (btn && process.argv[4] === 'open') {
  await p.mouse.click(btn.x, btn.y);
  const samples = []; for (let i = 0; i < 8; i++) { await p.waitForTimeout(80); samples.push(...await p.evaluate(() => document.getAnimations().map(a => { const t = a.effect?.getTiming?.(); let kf = []; try { kf = a.effect.getKeyframes().map(k => { const { composite, computedOffset, offset, easing, ...o } = k; return o; }); } catch {} return JSON.stringify({ t: a.effect?.target?.getAttribute?.('data-framer-name') || a.effect?.target?.tagName, d: t?.duration, dl: t?.delay, e: (t?.easing || '').slice(0, 50), kf }); }))); }
  console.log('ANIMS', [...new Set(samples)].slice(0, 20).join('\n'));
  await p.waitForTimeout(1000);
  console.log(JSON.stringify(await dump(), null, 1));
  await p.screenshot({ path: process.argv[5] });
}
await b.close();
