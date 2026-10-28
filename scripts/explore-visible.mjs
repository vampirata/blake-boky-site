// Dump visible text blocks, images, videos, links of a page at 1440 for template discovery.
import { chromium } from 'playwright';
const url = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
});
await page.waitForLoadState('networkidle');
await page.waitForTimeout(800);
const out = await page.evaluate(() => {
  const vis = el => { let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false; e = e.parentElement; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const items = [];
  const sy = window.scrollY;
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,img,video,button,[style*="background-image"]').forEach(el => {
    if (!vis(el)) return;
    const r = el.getBoundingClientRect();
    const o = { tag: el.tagName, y: Math.round(r.top + sy), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), fw: el.closest('[data-framer-name]')?.getAttribute('data-framer-name') };
    if (el.tagName === 'IMG') { o.src = el.currentSrc || el.src; o.alt = el.alt; o.nw = el.naturalWidth; o.nh = el.naturalHeight; o.fit = getComputedStyle(el).objectFit; }
    else if (el.tagName === 'VIDEO') { o.src = el.currentSrc || el.querySelector('source')?.src; o.poster = el.poster; }
    else if (el.tagName === 'A') { o.href = el.getAttribute('href'); o.text = el.innerText.trim().slice(0, 80); }
    else if (el.style.backgroundImage) { o.bg = el.style.backgroundImage; }
    else o.text = el.innerText.trim();
    items.push(o);
  });
  return { title: document.title, h: document.body.scrollHeight, items };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
