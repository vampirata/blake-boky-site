// Phase 2: parse the visible-content dumps from collections-render.mjs into CMS JSON,
// download original assets, validate. Usage:
//   node scripts/collections-render.mjs <rawDir>   (renders pages in Playwright)
//   node scripts/extract-collections.mjs <rawDir>
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = process.argv[2] || path.join(os.tmpdir(), 'bb-collections-raw');
const BASE = 'https://blakeandboky.com';
const DATA = path.join(REPO, 'src/content/data');
fs.mkdirSync(DATA, { recursive: true });

const raw = {};
for (const f of fs.readdirSync(RAW).filter(f => f.endsWith('.json'))) raw[f.replace('.json', '').split('__').join('/')] = JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));
const anomalies = [];
const note = (page, msg) => anomalies.push({ page, msg });

// ---------- assets ----------
const assetMap = new Map(); // original url -> local public path
const assetQueue = [];
function claim(url, folder) {
  if (!url) return null;
  const u = new URL(url, BASE);
  if (!/framerusercontent\.com$/.test(u.hostname)) { note(folder, `non-framer asset ${url}`); return url; }
  const orig = u.origin + u.pathname;
  if (!assetMap.has(orig)) {
    const local = `/assets/${folder}/${path.basename(u.pathname)}`;
    assetMap.set(orig, local);
    assetQueue.push({ orig, local });
  }
  return assetMap.get(orig);
}
const dims = new Map();
async function downloadAll() {
  let i = 0;
  const worker = async () => {
    while (i < assetQueue.length) {
      const { orig, local } = assetQueue[i++];
      const file = path.join(REPO, 'public', local);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
        for (let a = 1; a <= 3; a++) {
          try { const r = await fetch(orig); if (!r.ok) throw new Error(r.status); fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); break; }
          catch (e) { if (a === 3) note(local, `download failed ${orig}: ${e.message}`); }
        }
      }
      try {
        const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
        dims.set(local, { w: +out.match(/pixelWidth: (\d+)/)[1], h: +out.match(/pixelHeight: (\d+)/)[1] });
      } catch { /* non-image */ }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

// image record (finalised after download so natural size comes from the original file)
const imgRecords = [];
function imgRec(it, folder, role) {
  const rec = {
    role, src: claim(it.src, folder), alt: it.alt || '',
    naturalWidth: null, naturalHeight: null,
    rendered: { width: it.w, height: it.h, x: it.x, y: it.y },
    objectFit: it.fit, objectPosition: it.pos,
    cropped: false, liveUrl: it.src,
    _domNatural: { w: it.nw, h: it.nh },
  };
  imgRecords.push(rec);
  return rec;
}
function finaliseImages() {
  for (const r of imgRecords) {
    const d = dims.get(r.src) || { w: r._domNatural.w, h: r._domNatural.h };
    r.naturalWidth = d.w; r.naturalHeight = d.h;
    const na = d.w / d.h, ra = r.rendered.width / r.rendered.height;
    r.naturalAspect = +na.toFixed(4); r.renderedAspect = +ra.toFixed(4);
    r.cropped = r.objectFit === 'cover' && Math.abs(ra / na - 1) > 0.05;
    if (r.cropped) r.cropPercentHidden = +(100 * (1 - Math.min(ra / na, na / ra))).toFixed(1);
    delete r._domNatural;
  }
}

// ---------- helpers ----------
const content = d => d.items.filter(i => i.chrome !== 'footer' && i.chrome !== 'nav' && !(i.chrome === 'fixed' && !(i.text || '').startsWith('←')));
const isTxt = i => /^(H[1-6]|P|LI|BLOCKQUOTE)$/.test(i.tag);
const within = (i, box) => i.y >= box.y - 1 && i.y <= box.y + box.h + 1 && i.x >= box.x - 1 && i.x <= box.x + box.w + 1;
const slugOf = abs => new URL(abs).pathname.replace(/\/$/, '').split('/').pop();
const block = i => ({ tag: i.tag.toLowerCase(), html: i.html, text: i.text });
const seo = h => ({ title: h.title, description: h.description, ogTitle: h.ogTitle, ogDescription: h.ogDescription, ogImage: h.ogImage, canonical: h.canonical });
const artistOf = s => { const t = (s || '').toUpperCase(); const b = t.includes('BLAKE'), k = t.includes('BOKY'); return b && k ? 'Blake & Boky' : b ? 'Blake' : k ? 'Boky' : null; };
function sectionOrder(items, map) {
  const firsts = new Map();
  for (const i of items) { const s = map(i); if (s && !firsts.has(s)) firsts.set(s, i.y); }
  return [...firsts].sort((a, b) => a[1] - b[1]).map(x => x[0]);
}
function cards(items, folder, page) {
  return items.filter(i => i.tag === 'A' && i.href && items.some(j => j.tag === 'IMG' && within(j, i))).map(a => {
    const inner = items.filter(j => j !== a && within(j, a));
    const title = inner.find(j => isTxt(j) && j.names.at(-1) === 'Title');
    const date = inner.find(j => isTxt(j) && j.names.at(-1) === 'Date');
    const img = inner.find(j => j.tag === 'IMG');
    return { title: title?.text ?? null, date: date?.text ?? null, href: a.href, target: new URL(a.abs).pathname, image: imgRec(img, folder, 'card') };
  });
}

// ---------- works ----------
const works = [];
const workPages = Object.keys(raw).filter(k => k.split('/').length === 3).sort();
for (const key of workPages) {
  const d = raw[key]; const [, coll, slug] = key.split('/');
  const folder = `works/${slug}`; const items = content(d);
  const sec = i => {
    if ((i.text || '').startsWith('←') || (i.tag === 'A' && (i.text || '').startsWith('←')) || (i.names.length <= 1 && /^←/.test(i.text || ''))) return 'Back';
    const n = i.names;
    for (const k of ['Image Ticker', 'Gallery Lightbox', 'Prev Slot', 'Next Slot', 'Contact', 'Content 3', 'Content 2', 'Content', 'Name 1', 'Name', 'Title']) if (n.includes(k)) return k === 'Name 1' ? 'Name' : k;
    return null;
  };
  const by = s => items.filter(i => sec(i) === s);
  const txt = s => by(s).filter(isTxt);
  const title = txt('Title')[0]?.text ?? null;
  const name = txt('Name')[0]?.text ?? null;
  const blocks = { content: txt('Content').map(block), content2: txt('Content 2').map(block), content3: txt('Content 3').map(block) };
  const fields = {}; const fieldOrder = []; const inferred = [];
  for (const b of [...blocks.content, ...blocks.content2, ...blocks.content3]) for (const line of b.text.split('\n')) {
    const m = line.match(/^\s*([A-Za-z][A-Za-z .]{1,30}?)\s+:\s*(.*?)\s*$/);
    const ed = !m && line.match(/^\s*(Edition of .*?)\s*$/);
    if (ed) { if (fields.Edition === undefined) { fields.Edition = ed[1]; fieldOrder.push('Edition'); inferred.push('Edition'); } continue; }
    if (m) { if (fields[m[1]] !== undefined) fields[m[1]] += ' / ' + m[2]; else fields[m[1]] = m[2]; fieldOrder.push(m[1]); if (!m[2]) note(key, `empty field "${m[1]}"`); }
  }
  const ticker = []; for (const i of by('Image Ticker').filter(i => i.tag === 'IMG')) if (!ticker.some(t => t.liveUrl.split('?')[0] === i.src.split('?')[0])) ticker.push(imgRec(i, folder, 'ticker'));
  const images = by('Gallery Lightbox').filter(i => i.tag === 'IMG').map(i => imgRec(i, folder, 'gallery'));
  const seen = new Set(); for (const im of images) { if (seen.has(im.src)) note(key, `gallery shows the same image twice: ${im.src}`); seen.add(im.src); }
  const slot = s => { const a = by(s).find(i => i.tag === 'A'); if (!a) return null; const inner = by(s).filter(j => j !== a && within(j, a));
    return { label: inner.find(j => j.names.at(-1) === 'Label')?.text ?? null, title: inner.find(j => j.names.at(-1) === 'Title')?.text ?? null, href: a.href, slug: slugOf(a.abs), thumb: inner.find(j => j.tag === 'IMG') ? imgRec(inner.find(j => j.tag === 'IMG'), folder, 'pagination-thumb') : null }; };
  const pag = items.filter(i => i.names.includes('Pagination') && i.tag === 'A');
  const prevNext = { prev: slot('Prev Slot'), next: slot('Next Slot') };
  const backs = items.filter(i => i.tag === 'A' && (i.text || '').startsWith('←'));
  const back = backs.map(a => ({ label: a.text.replace(/^←\s*/, '').trim(), href: a.href, target: new URL(a.abs).pathname, fixed: a.chrome === 'fixed' }));
  const c = by('Contact');
  const contact = { eyebrow: c.find(i => i.names.at(-1) === 'Eyebrow')?.text, heading: c.find(i => i.names.at(-1) === 'Heading')?.text, line: c.find(i => i.names.at(-1) === 'Line')?.text, button: (() => { const a = c.find(i => i.tag === 'A'); return a ? { label: a.text, href: a.href } : null; })() };
  if (/\{\{/.test(d.head.title)) note(key, `page <title> has an unresolved template variable: "${d.head.title}"`);
  if (/Zilo|Sidebay/.test(d.head.title)) note(key, `page <title> still carries the Framer template name: "${d.head.title}"`);
  if (!blocks.content.length && !blocks.content2.length && !blocks.content3.length) note(key, 'no description text at all');
  for (const b of [...blocks.content, ...blocks.content2, ...blocks.content3]) if (!b.text.trim()) note(key, `empty rich-text paragraph in ${b.tag}`);
  const template = items.some(i => i.names.includes('Pagination')) ? 'work-indiv' : 'work-zilo';
  works.push({ slug, collection: coll, template, title, name, artist: null, fields, fieldOrder, fieldsInferredFromProse: inferred, description: blocks.content.map(b => b.html).filter(h => h.replace(/<br>/g, '').trim()), details: [...blocks.content2, ...blocks.content3].map(b => b.html).filter(h => h.replace(/<br>/g, '').trim()), richText: blocks, images, tickerImages: template === 'work-zilo' ? ticker : [], prevNext, back, contact, seo: seo(d.head),
    sectionOrder: sectionOrder(items, i => sec(i) === 'Image Ticker' && template !== 'work-zilo' ? null : sec(i) === 'Back' && i.chrome === 'fixed' ? 'Back (fixed)' : sec(i)) });
}

// ---------- collections ----------
const collections = [];
for (const key of Object.keys(raw).filter(k => k.split('/').length === 2)) {
  const d = raw[key]; const slug = key.split('/')[1]; const folder = `collections/${slug}`; const items = content(d);
  const back = items.filter(i => i.tag === 'A' && (i.text || '').startsWith('←')).map(a => ({ label: a.text.replace(/^←\s*/, '').trim(), href: a.href, fixed: a.chrome === 'fixed' }));
  const comingSoon = slug.startsWith('coming-soon');
  if (comingSoon) {
    const T = items.filter(isTxt);
    const hero = T.filter(i => i.names.includes('Hero'));
    const textCol = T.filter(i => i.names.includes('Text Col') && !i.names.includes('CTA'));
    const ctas = items.filter(i => i.tag === 'A' && i.names.includes('CTA')).map(a => ({ label: a.text, href: a.href, target: new URL(a.abs).pathname }));
    const plate = items.find(i => i.tag === 'IMG' && i.names.includes('Plate'));
    const els = items.filter(i => i.names.includes('Elsewhere'));
    const elsCards = cards(els, folder, key);
    for (const cd of elsCards) if (cd.target === `/collections/${slug}` || /coming-soon/.test(cd.target) && !/Silentium|Figures|Public/.test(cd.title)) note(key, `"In the meantime" card "${cd.title.trim()}" links to ${cd.target}`);
    collections.push({ slug, template: 'coming-soon', title: hero.find(i => i.tag === 'H1')?.text, eyebrow: hero[0]?.text, artist: artistOf(hero[0]?.text), comingSoon: true, status: hero.find(i => i.names.at(-1) === 'Status')?.text,
      intro: textCol.map(b => b.html), introBlocks: textCol.map(block), ctas, hero: plate ? { image: imgRec(plate, folder, 'hero') } : null, gallery: [], meta: {}, works: [],
      elsewhere: { eyebrow: T.find(i => i.names.at(-1) === 'Elsewhere' && i.y === Math.min(...T.filter(j => j.names.at(-1) === 'Elsewhere').map(j => j.y)))?.text, heading: T.filter(i => i.names.at(-1) === 'Elsewhere')[1]?.text, cards: elsCards },
      back, seo: seo(d.head), sectionOrder: ['Back (fixed)', 'Hero (eyebrow, H1, status)', 'Split (text + CTAs | plate image)', 'Elsewhere (eyebrow, heading, collection cards 4-up)', 'Footer'] });
    continue;
  }
  const T = items.filter(isTxt);
  const eyebrow = T.find(i => i.names.includes('Eyebrow'));
  const h1 = T.find(i => i.tag === 'H1');
  const theWorks = T.find(i => i.text.trim() === 'THE WORKS');
  // meta row: >=3 short uppercase P at the same y
  const rows = {}; for (const i of T) if (i.y > h1.y && i.y < theWorks.y && /^[A-Z ]{2,20}$/.test(i.text.trim()) && i.text.trim().length < 20) (rows[i.y] ||= []).push(i);
  const labelRow = Object.values(rows).find(r => r.length >= 3) || [];
  const labelY = labelRow[0]?.y ?? Infinity;
  const meta = {}; const metaOrder = [];
  for (const l of labelRow.sort((a, b) => a.x - b.x)) { const v = T.find(j => j !== l && Math.abs(j.x - l.x) < 2 && j.y > l.y && j.y - l.y < 60); meta[l.text.trim()] = v ? v.text.trim() : ''; metaOrder.push(l.text.trim()); if (!v) note(key, `meta field "${l.text.trim()}" is empty`); }
  const intro = T.filter(i => i.y > h1.y && i.y < labelY && i !== eyebrow);
  const imgs = items.filter(i => i.tag === 'IMG' && i.y < theWorks.y).map(i => imgRec(i, folder, 'gallery'));
  const after = items.filter(i => i.y >= theWorks.y);
  const worksHeading = after.find(i => i.tag === 'H2')?.text;
  const workCards = cards(after, folder, key);
  for (const cd of workCards) if (!cd.target.startsWith(`/collections/${slug}/`)) note(key, `work card "${cd.title}" links outside the collection: ${cd.target}`);
  collections.push({ slug, template: 'collection', title: h1.text, eyebrow: eyebrow?.text, artist: artistOf(eyebrow?.text), comingSoon: false,
    intro: intro.map(b => b.html), introBlocks: intro.map(block), meta, metaOrder, hero: imgs[0] ? { image: imgs[0] } : null, gallery: imgs,
    worksEyebrow: theWorks.text, worksHeading, works: workCards.map(c => slugOf(new URL(c.target, BASE).href)), workCards, back, seo: seo(d.head),
    sectionOrder: ['Back (fixed)', 'Head (eyebrow artist, H1 title)', ...(intro.length ? ['Intro text (p / h4 quotes)'] : []), 'Meta row (YEAR, CATEGORY, SIZE, MEDIUM)', 'Image grid (2-up 710x620, then full-width or 3-up)', 'The Works (eyebrow, H2, work cards 4-up)', 'Footer'] });
}

// ---------- index ----------
const idx = raw['collections']; const items = content(idx);
const idxCards = cards(items.filter(i => i.names.includes('Blog Posts')), 'collections/index', 'collections');
const cta = items.filter(i => !i.names.includes('Blog Posts') && i.y > Math.max(...idxCards.map(c => c.image.rendered.y)));
const ctaImg = cta.find(i => i.tag === 'IMG');
const collectionsIndex = {
  seo: seo(idx.head),
  heading: items.find(i => isTxt(i) && i.names.includes('Arrive'))?.text,
  cards: idxCards.map(c => ({ ...c, collectionSlug: c.target.split('/')[2] || null })),
  cta: { image: ctaImg ? imgRec(ctaImg, 'collections/index', 'cta-background') : null, heading: cta.find(i => i.tag === 'H2')?.text, button: (() => { const a = cta.find(i => i.tag === 'A'); return a ? { label: a.text, href: a.href, target: new URL(a.abs).pathname } : null; })() },
  sectionOrder: ['Nav', 'Arrive (H4 "Collections")', 'Blog Posts grid (12 collection cards, 4-up 350x457: image 350x350, date, title)', 'CTA (full-bleed image 1440x638 with H2 + Contact Us button)', 'Footer'],
};
for (const c of collectionsIndex.cards) {
  const t = c.title.toLowerCase();
  const tgt = c.collectionSlug || '';
  const plausible = tgt && (t.includes(tgt.replace(/-/g, ' ')) || (tgt === 'spirit-collection' && t.includes('spirit')) || tgt.startsWith('coming-soon'));
  if (!plausible || (t.includes('andromeda') && tgt !== 'andromeda') || (t.includes('rethink') && tgt === 'in-lucem')) note('collections', `index card "${c.title.trim()}" links to ${c.target}`);
}

// order collections as on /collections (first card linking to them), then the rest
// a card whose title names a collection (e.g. "Andromeda Collection") places that collection even if its link is wrong
const order = []; for (const c of collectionsIndex.cards) {
  const byTitle = collections.find(k => !k.comingSoon && c.title.toLowerCase().includes(k.title.toLowerCase()));
  const s = byTitle ? byTitle.slug : c.collectionSlug;
  if (s && !order.includes(s)) order.push(s);
}
collections.sort((a, b) => { const ia = order.indexOf(a.slug), ib = order.indexOf(b.slug); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
for (const c of collections) c.indexCards = collectionsIndex.cards.filter(k => k.collectionSlug === c.slug).map(k => k.title.trim());
// work artist from collection; order works by collection then on-page order
for (const w of works) { const c = collections.find(c => c.slug === w.collection); w.artist = c?.artist ?? null; w.collectionTitle = c?.title; }
works.sort((a, b) => { const ca = collections.findIndex(c => c.slug === a.collection), cb = collections.findIndex(c => c.slug === b.collection);
  if (ca !== cb) return ca - cb; const ws = collections[ca].works; return ws.indexOf(a.slug) - ws.indexOf(b.slug); });
for (const w of works) { const t = w.back.find(b => b.fixed); if (t && t.label !== w.collectionTitle) note(w.slug, `back link label "${t.label}" but collection is "${w.collectionTitle}" (href ${t.href})`); }

await downloadAll();
finaliseImages();

fs.writeFileSync(path.join(DATA, 'collections.json'), JSON.stringify(collections, null, 2) + '\n');
fs.writeFileSync(path.join(DATA, 'works.json'), JSON.stringify(works, null, 2) + '\n');
fs.writeFileSync(path.join(DATA, 'collections-index.json'), JSON.stringify(collectionsIndex, null, 2) + '\n');
fs.writeFileSync(path.join(RAW, '..', 'anomalies.json'), JSON.stringify(anomalies, null, 2));

// ---------- validate ----------
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
const smWorks = [...sm.matchAll(/<loc>[^<]*\/collections\/[^/<]+\/([^/<]+)<\/loc>/g)].map(m => m[1]);
const missing = smWorks.filter(s => !works.some(w => w.slug === s));
const refs = new Set(); JSON.stringify([collections, works, collectionsIndex], (k, v) => { if (typeof v === 'string' && v.startsWith('/assets/')) refs.add(v); return v; });
const missingFiles = [...refs].filter(r => !fs.existsSync(path.join(REPO, 'public', r)));
let bytes = 0; for (const r of refs) if (fs.existsSync(path.join(REPO, 'public', r))) bytes += fs.statSync(path.join(REPO, 'public', r)).size;
const recs = imgRecords;
console.log({ collections: collections.length, works: works.length, sitemapWorks: smWorks.length, missingWorks: missing, assets: refs.size, missingFiles, totalMB: +(bytes / 1048576).toFixed(1),
  imageRecords: recs.length, croppedRecords: recs.filter(r => r.cropped).length, croppedUniqueImages: new Set(recs.filter(r => r.cropped).map(r => r.src)).size,
  croppedByRole: recs.filter(r => r.cropped).reduce((a, r) => (a[r.role] = (a[r.role] || 0) + 1, a), {}), anomalies: anomalies.length });
