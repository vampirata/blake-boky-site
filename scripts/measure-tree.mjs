import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +process.argv[3]||1440, height: 900 } });
await p.goto('https://blakeandboky.com'+(process.argv[2]||'/'), { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const out = [];
  function walk(el, d) {
    if (d > 5) return;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    out.push(`${'  '.repeat(d)}${el.tagName.toLowerCase()}${el.id?'#'+el.id:''} [${el.getAttribute('data-framer-name')||''}] cls=${(el.className.baseVal??el.className).toString().slice(0,40)} y=${Math.round(r.top+scrollY)} h=${Math.round(r.height)} x=${Math.round(r.left)} w=${Math.round(r.width)} pos=${cs.position} disp=${cs.display} bg=${cs.backgroundColor} pad=${cs.padding} gap=${cs.gap} kids=${el.children.length}`);
    for (const c of el.children) if (!['SCRIPT','STYLE','LINK','META'].includes(c.tagName)) walk(c, d+1);
  }
  walk(document.body, 0);
  return out.join('\n');
});
console.log(r);
await b.close();
