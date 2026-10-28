import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [390, 810]) {
  const p = await b.newPage({ viewport: { width: w, height: 1000 } });
  await p.goto('https://blakeandboky.com/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const box = await p.evaluate(() => { const n = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().width > 0); const r = n.getBoundingClientRect(); const s = n.querySelector('svg').getBoundingClientRect(); return { r: [r.left, r.top, r.width, r.height], btn: [s.left + s.width / 2, s.top + s.height / 2] }; });
  await p.evaluate(() => { window.__t = []; const t0 = performance.now(); const tick = () => { const n = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().width > 0); const u = n.querySelector('[data-framer-name="Unfolded"]'); const sv = n.querySelector('svg'); window.__t.push([Math.round(performance.now() - t0), Math.round(n.getBoundingClientRect().height), u ? getComputedStyle(u).opacity : '-', getComputedStyle(sv).transform]); if (performance.now() - t0 < 1500) requestAnimationFrame(tick); }; window.__start = () => requestAnimationFrame(tick); });
  await p.evaluate(() => window.__start()); await p.mouse.click(box.btn[0], box.btn[1]); await p.waitForTimeout(1700);
  const t = await p.evaluate(() => window.__t);
  console.log(w, JSON.stringify(box), t.filter((_, i) => i % 4 === 0).map(x => x.join(' ')).join(' | '));
  await p.close();
}
await b.close();
