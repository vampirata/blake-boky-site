import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://blakeandboky.com/', { waitUntil: 'networkidle' });
const hero = () => p.evaluate(() => [...document.querySelectorAll('[data-framer-name="Hero"] img')].map(i => { const r = i.getBoundingClientRect(); let e = i, tf = []; for (let k = 0; k < 5 && e; k++, e = e.parentElement) { const t = getComputedStyle(e).transform; if (t !== 'none') tf.push(t); } return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} ${tf.join('|').slice(0, 80)}`; }));
console.log('t0', await hero()); await p.waitForTimeout(1500); console.log('t1.5', await hero());
await p.mouse.move(100, 100); await p.waitForTimeout(800); console.log('mouse TL', await hero());
await p.mouse.move(1300, 800); await p.waitForTimeout(800); console.log('mouse BR', await hero());
const heroAnims = await p.evaluate(() => document.getAnimations().map(a => `${a.effect?.target?.tagName} ${a.effect?.getTiming().duration} ${a.effect?.getTiming().iterations} ${(a.effect?.getTiming().easing||'').slice(0,40)} ${JSON.stringify(a.effect?.getKeyframes?.().map(k => k.transform || k.opacity)).slice(0,150)}`));
console.log('anims', heroAnims.slice(0, 10));
// scroll-linked checks
const probe = () => p.evaluate(() => { const fs = document.querySelector('[data-framer-name="Fullscreen Section"]'); const inner = fs?.firstElementChild; const ir = (fs?.querySelector('img') || fs?.querySelector('video'))?.getBoundingClientRect(); const stats = [...document.querySelectorAll('p, span')].filter(e => getComputedStyle(e).fontFamily.includes('Switzer') && parseFloat(getComputedStyle(e).fontSize) > 60).map(e => e.textContent); const hm = document.querySelector('[data-framer-name="Hero Main"]'); return { sy: Math.round(scrollY), fsTop: Math.round(fs.getBoundingClientRect().top), fsImg: ir && [Math.round(ir.top), Math.round(ir.height)], fsInnerTf: inner && getComputedStyle(inner.querySelector('*') || inner).transform, media: fs?.querySelector('video') ? 'video' : 'img', stats: stats.join(' '), heroOpacity: getComputedStyle(hm.firstElementChild).opacity, heroTf: getComputedStyle(hm.firstElementChild).transform }; });
await p.mouse.move(700, 400);
for (let i = 0; i < 16; i++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(250); console.log(JSON.stringify(await probe())); }
for (let i = 0; i < 6; i++) { await p.waitForTimeout(500); console.log('idle', JSON.stringify(await probe())); }
await b.close();
