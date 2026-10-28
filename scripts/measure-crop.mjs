// Crop audit: images whose rendered aspect differs from natural aspect by >5% under object-fit: cover.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const REF = fileURLToPath(new URL('../docs/reference/', import.meta.url));
const rows = new Map();
for (const f of fs.readdirSync(REF + 'layout').filter(f => /-\d+\.json$/.test(f))) {
  const [, tpl, w] = f.match(/^(.*)-(\d+)\.json$/); const L = JSON.parse(fs.readFileSync(REF + 'layout/' + f));
  for (const i of L.imgs) {
    if (!i.cut || i.fit !== 'cover' || i.cut.pct <= 5) continue;
    const k = `${tpl}|${i.parent}|${w}`; const r = rows.get(k) || { tpl, parent: i.parent, w: +w, frame: `${i.w}x${i.h}`, frameAspect: i.renderedAspect, pos: i.pos, n: 0, min: 99, max: 0, axis: new Set(), worst: '', srcs: [] };
    r.n++; r.axis.add(i.cut.axis); if (i.cut.pct > r.max) { r.max = i.cut.pct; r.worst = `${i.src} (${i.alt || 'no alt'}) nat ${i.naturalAspect}`; } r.min = Math.min(r.min, i.cut.pct); if (r.srcs.length < 40) r.srcs.push({ src: i.src, alt: i.alt, nat: i.naturalAspect, cut: i.cut }); rows.set(k, r);
  }
}
const list = [...rows.values()].sort((a, b) => a.tpl.localeCompare(b.tpl) || b.w - a.w);
fs.writeFileSync(REF + 'crop-audit.json', JSON.stringify(list.map(r => ({ ...r, axis: [...r.axis] })), null, 1));
for (const r of list) console.log(`${r.tpl} | ${r.parent} | ${r.w} | ${r.frame} (${r.frameAspect}) | n=${r.n} | ${[...r.axis].join('/')} ${r.min}-${r.max}% | worst ${r.worst}`);
