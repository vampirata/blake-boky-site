// Measures the live Framer site: screenshots, text dump, layout, images, motion.
// Usage: node scripts/measure-all.mjs [templateFilter] [widthFilter]
import { chromium } from 'playwright';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const BASE = 'https://blakeandboky.com';
const REF = fileURLToPath(new URL('../docs/reference/', import.meta.url));
const TEMPLATES = {
  home: '/', collections: '/collections', 'collection-detail': '/collections/spirit-collection',
  'artwork-detail': '/collections/spirit-collection/angel-forces', 'collection-coming-soon': '/collections/coming-soon-blake',
  'past-works': '/past-works', 'past-work-detail': '/past-works/the-story', news: '/news',
  'news-article': '/news/sculptures_symbolisiing_hope', galleries: '/galleriespetley',
  'gallery-detail': '/galleriespetley/petley-jones', 'blake-bio': '/blake-bio', 'boky-bio': '/boky-bio', contact: '/contact',
};
const WIDTHS = [[1440, 900], [810, 1100], [390, 844]];
const [tf, wf] = process.argv.slice(2);
for (const d of ['screens', 'text', 'layout']) fs.mkdirSync(REF + d, { recursive: true });

const browser = await chromium.launch();

async function scrollThrough(page) {
  // Lenis is active: drive with wheel so Framer scroll appears fire like a real user.
  await page.mouse.move(200, 200);
  let last = -1, same = 0;
  for (let i = 0; i < 400; i++) {
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(120);
    const y = await page.evaluate(() => scrollY);
    if (y === last) { if (++same > 6) break; } else same = 0;
    last = y;
  }
  await page.waitForTimeout(1500);
}

const COLLECT = () => {
  const vw = innerWidth, sy = scrollY;
  const rgb2hex = c => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return c; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); const h = '#' + p.slice(0, 3).map(n => Math.round(n).toString(16).padStart(2, '0')).join(''); return p.length > 3 && p[3] < 1 ? `${h}@${p[3]}` : h; };
  const visible = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; } return true; };
  const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height) }; };
  // text
  const texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const t = n.textContent.replace(/\s+/g, ' ').trim(); if (!t) continue;
    const el = n.parentElement; if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE'].includes(el.tagName)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || !visible(el)) continue;
    const cs = getComputedStyle(el);
    texts.push({ text: t.slice(0, 60), y: Math.round(r.top + sy), x: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height), tag: el.tagName.toLowerCase(), font: cs.fontFamily.split(',')[0].replace(/"/g, ''), size: cs.fontSize, weight: cs.fontWeight, style: cs.fontStyle, ls: cs.letterSpacing, lh: cs.lineHeight, color: rgb2hex(cs.color), transform: cs.textTransform, align: cs.textAlign, deco: cs.textDecorationLine, link: !!el.closest('a') });
  }
  // sections: descend through display:contents & ssr-variant wrappers from #main root
  const root = document.querySelector('#main > div');
  const flat = [];
  const expand = el => { for (const c of el.children) { const cs = getComputedStyle(c); if (cs.display === 'contents') expand(c); else flat.push(c); } };
  expand(root);
  const sections = flat.filter(e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'none').map(e => {
    const cs = getComputedStyle(e);
    const kids = []; const ex = el => { for (const c of el.children) { const s = getComputedStyle(c); if (s.display === 'contents') ex(c); else if (c.getBoundingClientRect().height > 0) kids.push(c); } }; ex(e);
    return { name: e.getAttribute('data-framer-name') || e.tagName.toLowerCase(), tag: e.tagName.toLowerCase(), ...box(e), position: cs.position, top: cs.top, zIndex: cs.zIndex, bg: rgb2hex(cs.backgroundColor), bgImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 120) : null, padding: cs.padding, display: cs.display, flexDir: cs.flexDirection, gap: cs.gap, gridCols: cs.gridTemplateColumns, justify: cs.justifyContent, align: cs.alignItems,
      children: kids.slice(0, 12).map(c => { const s = getComputedStyle(c); return { name: c.getAttribute('data-framer-name') || c.tagName.toLowerCase(), ...box(c), bg: rgb2hex(s.backgroundColor), padding: s.padding, maxWidth: s.maxWidth, display: s.display, flexDir: s.flexDirection, gap: s.gap, gridCols: s.gridTemplateColumns }; }) };
  });
  // grids / repeated card containers (flex or grid with >=3 similar children)
  const grids = [];
  for (const el of document.querySelectorAll('#main *')) {
    const cs = getComputedStyle(el); if (!(cs.display === 'grid' || (cs.display === 'flex' && cs.flexWrap === 'wrap') || el.hasAttribute('data-framer-cursor') )) continue;
    const kids = [...el.children].filter(c => c.getBoundingClientRect().width > 0); if (kids.length < 2) continue;
    const ws = kids.map(k => Math.round(k.getBoundingClientRect().width)); const ys = new Set(kids.map(k => Math.round(k.getBoundingClientRect().top)));
    const firstRow = kids.filter(k => Math.round(k.getBoundingClientRect().top) === Math.round(kids[0].getBoundingClientRect().top)).length;
    grids.push({ name: el.getAttribute('data-framer-name') || '', ...box(el), display: cs.display, cols: cs.gridTemplateColumns, rows: cs.gridAutoRows, gap: cs.gap, padding: cs.padding, items: kids.length, perRow: firstRow, rowsCount: ys.size, itemW: ws.slice(0, 4), itemH: kids.slice(0, 4).map(k => Math.round(k.getBoundingClientRect().height)) });
  }
  // horizontal flex lists with many children (carousels/tickers)
  const rails = [];
  for (const el of document.querySelectorAll('#main ul, #main section, #main div')) {
    const cs = getComputedStyle(el); if (cs.display !== 'flex' || cs.flexDirection !== 'row' || cs.flexWrap === 'wrap') continue;
    if (el.children.length < 3) continue; const r = el.getBoundingClientRect(); if (el.scrollWidth > r.width + 4 || r.width > vw + 4)
      rails.push({ name: el.getAttribute('data-framer-name') || el.tagName, ...box(el), scrollW: el.scrollWidth, items: el.children.length, gap: cs.gap, overflowX: cs.overflowX, mask: cs.maskImage || cs.webkitMaskImage, transform: cs.transform });
  }
  // images
  const imgs = [...document.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > 4 && visible(i)).map(i => {
    const cs = getComputedStyle(i), r = i.getBoundingClientRect(); const nw = i.naturalWidth, nh = i.naturalHeight;
    const ra = r.width / r.height, na = nw && nh ? nw / nh : null; let cut = null;
    if (na && cs.objectFit === 'cover') { cut = na > ra ? { axis: 'x', pct: Math.round((1 - ra / na) * 1000) / 10 } : { axis: 'y', pct: Math.round((1 - na / ra) * 1000) / 10 }; }
    let radius = cs.borderRadius; for (let e = i.parentElement, k = 0; e && k < 4 && radius === '0px'; e = e.parentElement, k++) { const s = getComputedStyle(e); if (s.borderRadius !== '0px' && s.overflow !== 'visible') radius = s.borderRadius + '(ancestor)'; }
    return { src: (i.currentSrc || i.src).split('?')[0].split('/').pop(), alt: (i.alt || '').slice(0, 50), ...box(i), natural: [nw, nh], renderedAspect: +ra.toFixed(3), naturalAspect: na && +na.toFixed(3), fit: cs.objectFit, pos: cs.objectPosition, radius, cut, parent: i.closest('[data-framer-name]')?.getAttribute('data-framer-name') || '' };
  });
  const bgImgs = [...document.querySelectorAll('#main *')].filter(e => { const s = getComputedStyle(e); return s.backgroundImage.includes('url(') && e.getBoundingClientRect().width > 4; }).map(e => { const s = getComputedStyle(e); return { ...box(e), bgImage: s.backgroundImage.slice(0, 120), size: s.backgroundSize, pos: s.backgroundPosition }; });
  const videos = [...document.querySelectorAll('video')].map(v => ({ ...box(v), src: (v.currentSrc || v.src).split('/').pop(), autoplay: v.autoplay, loop: v.loop, muted: v.muted, playsInline: v.playsInline, controls: v.controls, fit: getComputedStyle(v).objectFit, poster: !!v.poster, paused: v.paused }));
  const iframes = [...document.querySelectorAll('iframe')].filter(f => f.getBoundingClientRect().width > 0).map(f => ({ ...box(f), src: f.src.slice(0, 100) }));
  // tallies
  const tally = {}; const add = (k, v) => { if (!v) return; (tally[k] ??= {})[v] = (tally[k][v] || 0) + 1; };
  for (const el of document.querySelectorAll('#main *')) {
    if (el.getBoundingClientRect().width < 1) continue; const s = getComputedStyle(el);
    if (s.borderRadius !== '0px') add('radius', s.borderRadius);
    if (s.boxShadow !== 'none') add('shadow', s.boxShadow);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) { const w = s['border' + side + 'Width']; if (w !== '0px' && s['border' + side + 'Style'] !== 'none') add('border', `${side.toLowerCase()} ${w} ${s['border' + side + 'Style']} ${rgb2hex(s['border' + side + 'Color'])}`); }
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') add('bg', rgb2hex(s.backgroundColor));
    if (s.backdropFilter && s.backdropFilter !== 'none') add('backdrop', s.backdropFilter);
    if (s.mixBlendMode !== 'normal') add('blend', s.mixBlendMode);
    if (s.cursor !== 'auto' && s.cursor !== 'pointer' && s.cursor !== 'default') add('cursor', s.cursor);
  }
  // hairlines: elements <=2px tall or wide with bg
  const hairlines = [...document.querySelectorAll('#main div')].filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return (r.height > 0 && r.height <= 2 && r.width > 20 || r.width > 0 && r.width <= 2 && r.height > 20) && s.backgroundColor !== 'rgba(0, 0, 0, 0)'; }).map(e => ({ ...box(e), bg: rgb2hex(getComputedStyle(e).backgroundColor), name: e.getAttribute('data-framer-name') || '' }));
  // nav
  const navEl = [...document.querySelectorAll('nav, [data-framer-name*="Nav" i], [data-framer-name*="Desktop" i], [data-framer-name*="Phone" i], [data-framer-name*="Mobile" i]')].find(e => { const r = e.getBoundingClientRect(); let f = e; while (f && getComputedStyle(f).position !== 'fixed' && getComputedStyle(f).position !== 'sticky') f = f.parentElement; return f && r.top < 5 && r.height > 20 && r.height < 200; });
  let nav = null;
  if (navEl) { let f = navEl; while (f && !['fixed', 'sticky'].includes(getComputedStyle(f).position)) f = f.parentElement; const s = getComputedStyle(navEl); nav = { name: navEl.getAttribute('data-framer-name'), ...box(navEl), wrapperPos: getComputedStyle(f).position, bg: rgb2hex(s.backgroundColor), backdrop: s.backdropFilter, padding: s.padding, inner: [...navEl.querySelectorAll('[data-framer-name]')].slice(0, 20).map(c => { const cs = getComputedStyle(c); return { name: c.getAttribute('data-framer-name'), ...box(c), bg: rgb2hex(cs.backgroundColor), padding: cs.padding, gap: cs.gap }; }) }; }
  return { url: location.pathname, vw, docH: document.documentElement.scrollHeight, bodyBg: rgb2hex(getComputedStyle(document.body).backgroundColor), texts, sections, grids, rails, imgs, bgImgs, videos, iframes, tally, hairlines, nav };
};

// motion snapshot: elements with Framer appear state (inline opacity/transform) and running WAAPI animations
const MOTION = () => {
  const out = []; const sy = scrollY;
  for (const el of document.querySelectorAll('#main [style]')) {
    const st = el.style; if (!(st.opacity || st.transform || st.willChange)) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1) continue;
    out.push({ name: el.getAttribute('data-framer-name') || el.tagName.toLowerCase(), y: Math.round(r.top + sy), h: Math.round(r.height), opacity: st.opacity, transform: st.transform, willChange: st.willChange, filter: st.filter, clip: st.clipPath });
  }
  const anims = document.getAnimations().map(a => { const t = a.effect?.getTiming?.(); let kf = []; try { kf = a.effect.getKeyframes().map(k => ({ o: k.offset, opacity: k.opacity, transform: k.transform, easing: k.easing })); } catch {} return { type: a.constructor.name, name: a.animationName || a.transitionProperty || '', target: a.effect?.target?.getAttribute?.('data-framer-name') || a.effect?.target?.tagName, duration: t?.duration, delay: t?.delay, easing: t?.easing, iterations: t?.iterations, kf }; });
  return { inline: out, anims };
};

for (const [tpl, path] of Object.entries(TEMPLATES)) {
  if (tf && tf !== 'all' && !tf.split(',').includes(tpl)) continue;
  for (const [w, h] of WIDTHS) {
    if (wf && !wf.split(',').includes(String(w))) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const animLog = [];
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(400);
      const load = await page.evaluate(MOTION);
      // sample animations during first 2.5s (page-load reveals)
      for (let i = 0; i < 5; i++) { await page.waitForTimeout(400); animLog.push(await page.evaluate(() => document.getAnimations().map(a => { const t = a.effect?.getTiming?.(); let kf = []; try { kf = a.effect.getKeyframes().map(k => ({ o: k.offset, opacity: k.opacity, transform: k.transform, filter: k.filter, clipPath: k.clipPath })); } catch {} return { target: a.effect?.target?.getAttribute?.('data-framer-name') || a.effect?.target?.tagName, duration: t?.duration, delay: t?.delay, easing: t?.easing, kf }; }))); }
      const preScroll = await page.evaluate(MOTION);
      // scroll, sampling animations
      await page.mouse.move(200, 200);
      let last = -1, same = 0; const scrollAnims = [];
      for (let i = 0; i < 400; i++) {
        await page.mouse.wheel(0, 300); await page.waitForTimeout(110);
        if (i % 3 === 0) scrollAnims.push(...(await page.evaluate(() => document.getAnimations().map(a => { const t = a.effect?.getTiming?.(); let kf = []; try { kf = a.effect.getKeyframes().map(k => ({ o: k.offset, opacity: k.opacity, transform: k.transform })); } catch {} return { target: a.effect?.target?.getAttribute?.('data-framer-name') || a.effect?.target?.tagName, duration: t?.duration, delay: t?.delay, easing: t?.easing, kf: JSON.stringify(kf) }; }))));
        const y = await page.evaluate(() => scrollY); if (y === last) { if (++same > 6) break; } else same = 0; last = y;
      }
      await page.waitForTimeout(1500);
      // dedupe scroll anims
      const easings = [...new Set(scrollAnims.map(a => a.easing))]; const seen = new Map(); for (const a of scrollAnims) { a.easingId = easings.indexOf(a.easing); a.easing = a.easing?.slice(0, 40); const k = a.target + a.duration + a.easing + a.kf; if (!seen.has(k)) seen.set(k, a); }
      await page.evaluate(() => { window.lenis?.scrollTo?.(0, { immediate: true }); window.scrollTo(0, 0); });
      await page.waitForTimeout(1200);
      const data = await page.evaluate(COLLECT);
      const settled = await page.evaluate(MOTION);
      await page.screenshot({ path: `${REF}screens/${tpl}-${w}.png`, fullPage: true });
      fs.writeFileSync(`${REF}text/${tpl}-${w}.json`, JSON.stringify(data.texts, null, 1));
      const { texts, ...layout } = data;
      layout.motion = { atLoad: load.inline.filter(m => m.opacity && +m.opacity < 1 || (m.transform && m.transform !== 'none')).slice(0, 60), loadAnims: animLog.flat().filter((a, i, arr) => arr.findIndex(b => JSON.stringify(b) === JSON.stringify(a)) === i).slice(0, 40), preScrollHidden: preScroll.inline.filter(m => m.opacity && +m.opacity < 1).slice(0, 60), scrollAnims: [...seen.values()].slice(0, 60), easings, settledStillHidden: settled.inline.filter(m => m.opacity && +m.opacity < 1).slice(0, 30) };
      fs.writeFileSync(`${REF}layout/${tpl}-${w}.json`, JSON.stringify(layout, null, 1));
      console.log('ok', tpl, w, 'docH', data.docH, 'texts', texts.length, 'imgs', data.imgs.length);
    } catch (e) { console.log('FAIL', tpl, w, e.message.split('\n')[0]); }
    await ctx.close();
  }
}
await browser.close();
