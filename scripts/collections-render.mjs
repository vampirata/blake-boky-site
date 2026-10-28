// Phase 1: render every Collections CMS page at 1440x900 in Playwright and dump
// VISIBLE content (no raw HTML parsing). Output: one JSON per page in RAW_DIR.
// Usage: node scripts/collections-render.mjs [rawDir]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = 'https://blakeandboky.com';
const RAW = process.argv[2] || path.join(os.tmpdir(), 'bb-collections-raw');
fs.mkdirSync(RAW, { recursive: true });

const sm = await (await fetch(BASE + '/sitemap.xml')).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => /\/collections(\/|$)/.test(u));
console.log('pages', urls.length);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function dump(url) {
  const page = await ctx.newPage();
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  // slow scroll so lazy content mounts
  await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let y = 0;
    while (y < document.documentElement.scrollHeight) { window.scrollTo(0, y); y += 300; await sleep(150); }
    window.scrollTo(0, document.documentElement.scrollHeight); await sleep(600);
    window.scrollTo(0, 0); await sleep(400);
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  // make sure images are decoded
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  const data = await page.evaluate(() => {
    const isVis = el => {
      const r = el.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) return false;
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      }
      return true;
    };
    const chromeOf = el => {
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const t = e.tagName;
        if (t === 'FOOTER') return 'footer';
        if (t === 'NAV') return 'nav';
        if (getComputedStyle(e).position === 'fixed') return 'fixed';
      }
      return null;
    };
    const names = el => { const a = []; for (let e = el; e && e !== document.body; e = e.parentElement) { const n = e.getAttribute && e.getAttribute('data-framer-name'); if (n) a.unshift(n); } return a; };
    const sy = window.scrollY;
    const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + sy), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
    const cleanHTML = el => {
      const c = el.cloneNode(true);
      c.querySelectorAll('*').forEach(n => { [...n.attributes].forEach(a => { if (!(n.tagName === 'A' && (a.name === 'href' || a.name === 'target' || a.name === 'rel'))) n.removeAttribute(a.name); }); });
      return c.innerHTML.trim();
    };
    const items = [];
    const sel = 'h1,h2,h3,h4,h5,h6,p,li,a,img,video,button,blockquote,*';
    for (const el of document.body.querySelectorAll('*')) {
      const tag = el.tagName;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundImage && cs.backgroundImage.includes('url(') ? cs.backgroundImage : null;
      const isText = /^(H[1-6]|P|LI|BLOCKQUOTE)$/.test(tag);
      if (!(isText || tag === 'A' || tag === 'IMG' || tag === 'VIDEO' || bg)) continue;
      if (isText && el.parentElement && /^(H[1-6]|P|LI|BLOCKQUOTE)$/.test(el.parentElement.tagName)) continue;
      if (!isVis(el)) continue;
      const o = { tag, chrome: chromeOf(el), names: names(el), ...box(el) };
      if (tag === 'IMG') {
        Object.assign(o, { src: el.currentSrc || el.src, srcAttr: el.getAttribute('src'), alt: el.getAttribute('alt') || '', nw: el.naturalWidth, nh: el.naturalHeight, fit: cs.objectFit, pos: cs.objectPosition });
      } else if (tag === 'VIDEO') {
        Object.assign(o, { src: el.currentSrc || el.getAttribute('src') || el.querySelector('source')?.src, poster: el.getAttribute('poster'), vw: el.videoWidth, vh: el.videoHeight, fit: cs.objectFit, pos: cs.objectPosition, loop: el.loop, muted: el.muted, autoplay: el.autoplay });
      } else if (tag === 'A') {
        Object.assign(o, { href: el.getAttribute('href'), abs: el.href, text: el.innerText.trim(), target: el.getAttribute('target') });
      } else if (isText) {
        Object.assign(o, { text: el.innerText, html: cleanHTML(el), fontSize: cs.fontSize, fontWeight: cs.fontWeight, textTransform: cs.textTransform });
      }
      if (bg && !isText && tag !== 'A') { o.tag = tag === 'IMG' || tag === 'VIDEO' ? tag : 'BG'; o.bg = bg; o.bgSize = cs.backgroundSize; o.bgPos = cs.backgroundPosition; }
      else if (bg) o.bg = bg;
      items.push(o);
    }
    const meta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.getAttribute('content') || null;
    return {
      head: { title: document.title, description: meta('description'), ogTitle: meta('og:title'), ogDescription: meta('og:description'), ogImage: meta('og:image'), twitterImage: meta('twitter:image'), canonical: document.querySelector('link[rel=canonical]')?.href || null, lang: document.documentElement.lang },
      scrollHeight: document.documentElement.scrollHeight,
      items,
    };
  });
  data.url = url; data.finalUrl = page.url(); data.status = resp?.status();
  await page.close();
  return data;
}

for (const url of urls) {
  const slug = url.replace(BASE, '').replace(/^\//, '').replace(/\//g, '__') || 'root';
  const f = path.join(RAW, slug + '.json');
  if (fs.existsSync(f) && !process.env.FRESH) { console.log('cached', slug); continue; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { const d = await dump(url); fs.writeFileSync(f, JSON.stringify(d, null, 1)); console.log('ok', slug, d.items.length); break; }
    catch (e) { console.log('retry', slug, e.message); }
  }
}
await browser.close();
