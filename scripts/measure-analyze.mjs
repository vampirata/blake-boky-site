// Aggregates docs/reference/{text,layout} into docs/reference/summary-*.txt for writing the spec.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const REF = fileURLToPath(new URL('../docs/reference/', import.meta.url));
const tpls = [...new Set(fs.readdirSync(REF + 'layout').filter(f => /-\d+\.json$/.test(f)).map(f => f.replace(/-\d+\.json$/, '')))];
const W = [1440, 810, 390];
let out = '';
const P = s => (out += s + '\n');
// type scale
for (const w of W) {
  const g = new Map();
  for (const t of tpls) { const f = `${REF}text/${t}-${w}.json`; if (!fs.existsSync(f)) continue; for (const x of JSON.parse(fs.readFileSync(f))) { const k = [x.font, x.size, x.weight, x.style, x.lh, x.ls, x.transform].join(' | '); const e = g.get(k) || { n: 0, colors: new Set(), ex: new Set(), pages: new Set() }; e.n++; e.colors.add(x.color); if (e.ex.size < 3) e.ex.add(x.text.slice(0, 28)); e.pages.add(t); g.set(k, e); } }
  P(`\n### TYPE ${w}  (font | size | weight | style | lh | ls | transform) n colors examples`);
  [...g].sort((a, b) => parseFloat(b[0].split(' | ')[1]) - parseFloat(a[0].split(' | ')[1])).forEach(([k, e]) => P(`${k}  n=${e.n} [${[...e.colors].join(' ')}] ${[...e.ex].map(s => JSON.stringify(s)).join(' ')} p=${e.pages.size}`));
}
// colours
const col = {}; for (const t of tpls) for (const w of W) { const f = `${REF}layout/${t}-${w}.json`; if (!fs.existsSync(f)) continue; const L = JSON.parse(fs.readFileSync(f)); for (const [k, v] of Object.entries(L.tally.bg || {})) col['bg ' + k] = (col['bg ' + k] || 0) + v; for (const k of ['radius', 'shadow', 'border', 'backdrop', 'blend']) for (const [kk, v] of Object.entries(L.tally[k] || {})) col[k + ' ' + kk.slice(0, 140)] = (col[k + ' ' + kk.slice(0, 140)] || 0) + v; }
P('\n### TALLIES'); Object.entries(col).sort().forEach(([k, v]) => P(`${k}: ${v}`));
// per template
for (const t of tpls) for (const w of W) {
  const f = `${REF}layout/${t}-${w}.json`; if (!fs.existsSync(f)) continue; const L = JSON.parse(fs.readFileSync(f));
  P(`\n## ${t} @${w} docH=${L.docH} body=${L.bodyBg} nav=${L.nav ? `${L.nav.name} ${L.nav.h}px ${L.nav.wrapperPos} bg=${L.nav.bg}` : '-'}`);
  for (const s of L.sections) { P(`  [${s.name}] <${s.tag}> y=${s.y} h=${s.h} x=${s.x} w=${s.w} pos=${s.position}${s.position === 'sticky' ? ' top=' + s.top : ''} bg=${s.bg}${s.bgImage ? ' img' : ''} pad=${s.padding} ${s.display} ${s.flexDir} gap=${s.gap}${s.display === 'grid' ? ' cols=' + s.gridCols : ''}`); for (const c of s.children.slice(0, 8)) P(`      - [${c.name}] y=${c.y} h=${c.h} x=${c.x} w=${c.w} bg=${c.bg} pad=${c.padding} ${c.display} ${c.flexDir} gap=${c.gap}${c.maxWidth !== 'none' ? ' max=' + c.maxWidth : ''}${c.display === 'grid' ? ' cols=' + c.gridCols : ''}`); }
  const gr = L.grids.filter(g => g.w > 200 && g.itemW[0] > 60); if (gr.length) P('  GRIDS: ' + gr.slice(0, 8).map(g => `[${g.name}] y=${g.y} x=${g.x} w=${g.w} ${g.display} perRow=${g.perRow} items=${g.items} gap=${g.gap} pad=${g.padding} itemW=${g.itemW.join(',')} itemH=${g.itemH.join(',')}${g.display === 'grid' ? ' cols=' + g.cols : ''}`).join('\n         '));
  if (L.rails.length) P('  RAILS: ' + L.rails.slice(0, 4).map(r => JSON.stringify(r)).join(' '));
  if (L.videos.length) P('  VIDEO: ' + JSON.stringify(L.videos));
  if (L.iframes.length) P('  IFRAME: ' + JSON.stringify(L.iframes));
  if (L.hairlines.length) P('  HAIRLINES: ' + [...new Set(L.hairlines.map(h => `${h.w}x${h.h} ${h.bg} ${h.name}`))].slice(0, 6).join('; '));
  P('  IMGS: ' + L.imgs.map(i => `${i.parent}|${i.w}x${i.h}@${i.x},${i.y} ${i.fit} ${i.pos} r=${i.radius} nat=${i.natural.join('x')}${i.cut ? ` CUT ${i.cut.axis} ${i.cut.pct}%` : ''}`).join('\n        '));
  const m = L.motion; P(`  MOTION atLoad=${m.atLoad.length} preScrollHidden=${m.preScrollHidden.length} scrollAnims=${m.scrollAnims.length} loadAnims=${m.loadAnims.length}`);
  const uniq = new Map(); for (const a of [...m.loadAnims, ...m.scrollAnims]) { const k = `${a.duration}|${a.delay}|${a.easing?.slice(0, 35)}|${typeof a.kf === 'string' ? a.kf : JSON.stringify(a.kf)}`; uniq.set(k, (uniq.get(k) || 0) + 1); }
  for (const [k, v] of uniq) P(`     anim x${v}: ${k.slice(0, 220)}`);
  const hid = new Map(); for (const h of m.preScrollHidden) { const k = `${h.name} op=${h.opacity} tf=${h.transform}`; hid.set(k, (hid.get(k) || 0) + 1); } for (const [k, v] of hid) P(`     hidden x${v}: ${k}`);
}
fs.writeFileSync(REF + 'summary.txt', out); console.log('lines', out.split('\n').length);
