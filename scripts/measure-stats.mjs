import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://blakeandboky.com/', { waitUntil: 'networkidle' });
const st = () => p.evaluate(() => [...document.querySelectorAll('p, span')].filter(e => getComputedStyle(e).fontFamily.includes('Switzer') && parseFloat(getComputedStyle(e).fontSize) > 60 && !e.querySelector('span')).map(e => e.textContent).join(' '));
await p.mouse.move(700, 400);
for (let i = 0; i < 9; i++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(120); }
const t0 = Date.now(); for (let i = 0; i < 14; i++) { console.log(Date.now() - t0, await st()); await p.waitForTimeout(400); }
// scroll away and back
await p.mouse.wheel(0, -2000); await p.waitForTimeout(1500); console.log('away', await st());
for (let i = 0; i < 9; i++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(120); } await p.waitForTimeout(4000); console.log('back', await st());
const cases = await p.evaluate(() => [...document.querySelectorAll('[data-framer-name="Case"]')].map(c => c.innerText.replace(/\s+/g, ' ').slice(0, 40) + ' | img=' + !!c.querySelector('img')));
console.log(cases);
await b.close();
