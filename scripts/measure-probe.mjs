import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://blakeandboky.com/', { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const mq = new Set(), ff = [];
  for (const s of document.styleSheets) { try { for (const rule of s.cssRules) {
    if (rule.media) mq.add(rule.media.mediaText);
    if (rule.constructor.name === 'CSSFontFaceRule') ff.push(rule.cssText.slice(0, 300));
  } } catch (e) { mq.add('XS:' + s.href); } }
  return { mq: [...mq], ff: ff.slice(0, 60), ffCount: ff.length, lenis: !!document.querySelector('.lenis, html.lenis') || !!window.lenis, htmlClass: document.documentElement.className, links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')).slice(0, 60), anims: document.getAnimations().length, scripts: [...document.scripts].map(s => s.src).filter(Boolean) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
