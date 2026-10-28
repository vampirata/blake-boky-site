import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => {
  const vis = el => { const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false; let e = el; while (e) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false; e = e.parentElement; } return true; };
  const chain = el => { const a = []; let e = el; while (e && e !== document.body) { const n = e.getAttribute('data-framer-name'); a.unshift(e.tagName.toLowerCase() + (n ? `[${n}]` : '') + (getComputedStyle(e).position === 'fixed' ? '{F}' : '')); e = e.parentElement; } return a.filter(x => x.includes('[') || /^(header|footer|nav|main|section)/.test(x) || x.includes('{F}')).join(' > '); };
  const pick = [...document.querySelectorAll('h1,h2,p,a')].filter(vis);
  const seen = new Set(); const out = [];
  for (const el of pick) { const c = chain(el); const k = c.split(' > ').slice(0, 4).join(' > '); if (seen.has(k)) continue; seen.add(k); out.push(k + '  ::  ' + el.innerText.slice(0, 40).replace(/\n/g, ' ')); }
  const hrefs = [...document.querySelectorAll('a')].filter(vis).map(a => a.getAttribute('href') + ' | ' + a.innerText.replace(/\n/g, ' ').slice(0, 50));
  return out.join('\n') + '\n---\n' + hrefs.join('\n');
}));
await b.close();
