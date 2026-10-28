// Stage 1: render every in-scope page of blakeandboky.com in Chromium at 1440x900,
// scroll so lazy content mounts, and dump the VISIBLE DOM (display/visibility aware)
// as ordered sections of items. Also captures nav (desktop + 390 mobile menu),
// fonts, SEO and the contact form. Writes raw dumps to RAW_DIR; build-content.mjs
// turns them into src/content/data/*.json and downloads assets.
//
// Usage: node scripts/extract-pages.mjs [rawDir]
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://blakeandboky.com';
const RAW_DIR = process.argv[2] || path.resolve('scripts/.raw');
await fs.mkdir(RAW_DIR, { recursive: true });

const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const inScope = all.filter((p) => !p.startsWith('/collections'));
console.log(`sitemap: ${all.length} urls, in scope: ${inScope.length}`);

async function settle(page) {
	await page.waitForLoadState('networkidle').catch(() => {});
	let last = 0;
	for (let y = 0; y < 60000; y += 400) {
		await page.evaluate((y) => window.scrollTo(0, y), y);
		await page.waitForTimeout(150);
		const h = await page.evaluate(() => document.documentElement.scrollHeight);
		if (y > h) break;
		last = h;
	}
	await page.waitForTimeout(800);
	await page.waitForLoadState('networkidle').catch(() => {});
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(500);
	return last;
}

// Runs in the page. Returns a structured dump of visible content.
function dump() {
	const hidden = (e) => {
		for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
			const cs = getComputedStyle(n);
			if (cs.display === 'none' || cs.visibility === 'hidden') return true;
		}
		return false;
	};
	const sized = (e) => {
		const r = e.getBoundingClientRect();
		return r.width >= 1 && r.height >= 1;
	};
	const box = (e) => {
		const r = e.getBoundingClientRect();
		return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, x: Math.round(r.left), y: Math.round(r.top + scrollY) };
	};
	const abs = (u) => {
		if (u == null) return null;
		try { return new URL(u, location.href).href; } catch { return u; }
	};
	const cleanHtml = (el) => {
		const c = el.cloneNode(true);
		c.querySelectorAll('*').forEach((n) => {
			for (const a of [...n.attributes]) if (!['href', 'target', 'rel', 'src', 'alt'].includes(a.name)) n.removeAttribute(a.name);
		});
		for (const a of [...c.attributes]) c.removeAttribute(a.name);
		return c.outerHTML;
	};
	const fontOf = (e) => {
		const cs = getComputedStyle(e);
		return { family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: cs.color, transform: cs.textTransform };
	};
	const names = (e) => {
		const out = [];
		for (let n = e.parentElement; n && n.id !== 'main'; n = n.parentElement) {
			const nm = n.getAttribute && n.getAttribute('data-framer-name');
			if (nm) out.unshift(nm);
		}
		return out;
	};
	const items = [];
	let linkStack = [];
	let uid = 0;
	const push = (it, e) => { it.id = ++uid; it.framerPath = names(e); it.box = box(e); if (linkStack.length) it.linkId = linkStack[linkStack.length - 1]; items.push(it); };

	function walk(e) {
		if (e.nodeType === 3) {
			const t = e.textContent.replace(/\s+/g, ' ').trim();
			if (t && e.parentElement && sized(e.parentElement) && !e.parentElement.closest('[data-framer-component-type="RichTextContainer"],svg,style,script'))
				push({ kind: 'text', tag: e.parentElement.tagName.toLowerCase(), name: e.parentElement.getAttribute('data-framer-name'), text: e.textContent, plain: true, font: fontOf(e.parentElement) }, e.parentElement);
			return;
		}
		if (e.nodeType !== 1) return;
		const tag = e.tagName.toLowerCase();
		if (['script', 'style', 'noscript', 'template', 'link', 'meta'].includes(tag)) return;
		if (hidden(e)) return;
		const ct = e.getAttribute('data-framer-component-type');
		const nm = e.getAttribute('data-framer-name');
		if (ct === 'RichTextContainer') {
			if (!sized(e)) return;
			const blocks = [...e.children].filter((c) => !hidden(c)).map((c) => ({
				tag: c.tagName.toLowerCase(), text: c.innerText, html: cleanHtml(c),
				links: [...c.querySelectorAll('a')].map((a) => ({ text: a.innerText, href: a.getAttribute('href'), abs: abs(a.getAttribute('href')) })),
				imgs: [...c.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt })),
				font: fontOf(c.querySelector('.framer-text') || c),
			}));
			push({ kind: 'richtext', name: nm, blocks }, e);
			return;
		}
		if (tag === 'img') {
			if (!sized(e)) return;
			const cs = getComputedStyle(e);
			push({ kind: 'image', src: e.currentSrc || e.src || (e.srcset || '').split(' ')[0], srcset: e.getAttribute('srcset'), alt: e.alt, renderedNatural: [e.naturalWidth, e.naturalHeight], objectFit: cs.objectFit, objectPosition: cs.objectPosition, name: nm, href: abs(e.closest('a')?.getAttribute('href')) }, e);
			return;
		}
		if (tag === 'video') {
			push({ kind: 'video', src: e.currentSrc || e.getAttribute('src') || e.querySelector('source')?.src, poster: e.getAttribute('poster'), autoplay: e.autoplay, loop: e.loop, muted: e.muted, controls: e.controls, objectFit: getComputedStyle(e).objectFit, name: nm }, e);
			return;
		}
		if (tag === 'iframe') {
			push({ kind: 'iframe', src: e.src, title: e.title, name: nm }, e);
			return;
		}
		if (tag === 'svg') {
			if (!sized(e)) return;
			push({ kind: 'svg', name: nm || e.parentElement?.getAttribute('data-framer-name'), svg: e.outerHTML.length < 200000 ? e.outerHTML : null, href: abs(e.closest('a')?.getAttribute('href')) }, e);
			return;
		}
		if (['input', 'textarea', 'select'].includes(tag)) {
			const lab = e.closest('label');
			push({ kind: 'field', tag, type: e.type, fieldName: e.name, placeholder: e.placeholder, required: e.required, value: tag === 'select' ? null : e.value, options: tag === 'select' ? [...e.options].map((o) => ({ value: o.value, label: o.text })) : undefined, label: lab ? lab.innerText.trim() : null, autocomplete: e.autocomplete }, e);
			return;
		}
		const bg = getComputedStyle(e).backgroundImage;
		if (bg && bg !== 'none' && bg.includes('url(') && sized(e)) {
			const cs = getComputedStyle(e);
			push({ kind: 'bgimage', urls: [...bg.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]), size: cs.backgroundSize, position: cs.backgroundPosition, name: nm }, e);
		}
		if (tag === 'a') push({ display: getComputedStyle(e).display, zeroBox: !sized(e), kind: 'link', href: e.getAttribute('href'), abs: abs(e.getAttribute('href')), target: e.target, text: e.innerText.replace(/\s+/g, ' ').trim(), name: nm }, e);
		if (tag === 'button' && sized(e)) push({ kind: 'button', type: e.type, text: e.innerText.trim(), name: nm }, e);
		if (tag === 'form') push({ kind: 'form', action: e.getAttribute('action'), method: e.getAttribute('method'), name: nm }, e);
		if (tag === 'a') linkStack.push(uid);
		for (const c of e.childNodes) walk(c);
		if (tag === 'a') linkStack.pop();
	}

	// Find the section root: descend from the framer page root while there is a single visible child.
	const main = document.getElementById('main');
	const hasContent = (c) => !hidden(c) && !['SCRIPT', 'STYLE'].includes(c.tagName) && ((c.innerText || '').trim().length > 0 || [...c.querySelectorAll('img,video,iframe,svg')].some(sized));
	let root = main;
	for (;;) {
		const kids = [...root.children].filter(hasContent);
		if (kids.length === 1) root = kids[0]; else break;
	}
	// Sections: the outermost named (data-framer-name) or semantic elements under the page root.
	const SEM = ['section', 'header', 'footer', 'nav', 'figure', 'article', 'main', 'form'];
	const secEls = [];
	const TRANSPARENT = /^(Main|.+ BG)$/;
	const split = (el, viaWrapper = false) => {
		if (!hasContent(el)) return;
		const nm = el.getAttribute('data-framer-name');
		const kids = [...el.children].filter(hasContent);
		if (kids.length && ((nm && TRANSPARENT.test(nm)) || (viaWrapper && kids.length === 1 && nm === 'Wrap'))) { kids.forEach((k) => split(k, kids.length === 1)); return; }
		if (nm || SEM.includes(el.tagName.toLowerCase()) || el.getAttribute('data-framer-component-type') === 'RichTextContainer' || el.tagName === 'IMG') { secEls.push(el); return; }
		if (!kids.length) { secEls.push(el); return; }
		kids.forEach((k) => split(k, viaWrapper));
	};
	[...root.children].forEach((c) => split(c));
	const sections = secEls.map((c, i) => {
		const start = items.length;
		walk(c);
		return { index: i, tag: c.tagName.toLowerCase(), name: c.getAttribute('data-framer-name'), box: box(c), items: items.slice(start) };
	}).filter((s) => s.items.length);

	// Fonts
	const fontFaces = [];
	for (const sh of document.styleSheets) {
		let rules; try { rules = sh.cssRules; } catch { continue; }
		for (const r of rules) if (r.constructor.name === 'CSSFontFaceRule') {
			fontFaces.push({ family: r.style.getPropertyValue('font-family').replace(/["']/g, ''), weight: r.style.getPropertyValue('font-weight'), style: r.style.getPropertyValue('font-style'), unicodeRange: r.style.getPropertyValue('unicode-range'), src: r.style.getPropertyValue('src') });
		}
	}
	const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null;
	return {
		url: location.href,
		title: document.title,
		seo: {
			title: document.title,
			description: meta('meta[name="description"]'),
			ogTitle: meta('meta[property="og:title"]'),
			ogDescription: meta('meta[property="og:description"]'),
			ogImage: meta('meta[property="og:image"]'),
			twitterImage: meta('meta[name="twitter:image"]'),
			canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
			robots: meta('meta[name="robots"]'),
		},
		icons: [...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]')].map((l) => ({ rel: l.rel, href: l.href, media: l.media, sizes: l.getAttribute('sizes') })),
		bodyBg: getComputedStyle(document.body).backgroundColor,
		fontFaces,
		sections,
	};
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const network = new Set();
ctx.on('request', (r) => { const u = r.url(); if (/framerusercontent|fonts\.gstatic|forms|youtube|vimeo|\.pdf/i.test(u)) network.add(u); });

const results = {};
for (const p of inScope) {
	const page = await ctx.newPage();
	const t0 = Date.now();
	const resp = await page.goto(ORIGIN + p, { waitUntil: 'networkidle', timeout: 90000 });
	const h = await settle(page);
	const d = await page.evaluate(dump);
	d.status = resp?.status();
	d.scrollHeight = h;
	d.path = p;
	results[p] = d;
	const file = path.join(RAW_DIR, (p === '/' ? 'home' : p.slice(1).replace(/\//g, '__')) + '.json');
	await fs.writeFile(file, JSON.stringify(d, null, 2));
	console.log(`${p}  status=${d.status} sections=${d.sections.length} items=${d.sections.reduce((a, s) => a + s.items.length, 0)} ${Date.now() - t0}ms`);
	await page.close();
}

// Mobile nav at 390
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mp = await mctx.newPage();
await mp.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
await mp.waitForTimeout(1000);
const navBefore = await mp.evaluate(() => {
	const n = [...document.querySelectorAll('nav')].find((x) => x.getBoundingClientRect().height > 0 && getComputedStyle(x).display !== 'none');
	return n ? { name: n.getAttribute('data-framer-name'), text: n.innerText, html: n.outerHTML.length } : null;
});
let mobileNav = { before: navBefore, triggerName: null, links: [], text: null };
const trig = mp.locator('nav [data-framer-name="Menu"]').filter({ visible: true }).first();
if (await trig.count()) {
	mobileNav.triggerName = 'Menu (whole nav pill is the trigger; closed state shows logo only)';
	const bb = await trig.boundingBox();
	await mp.mouse.click(bb.x + bb.width - 20, bb.y + bb.height / 2);
	await mp.waitForTimeout(1500);
	mobileNav = {
		...mobileNav,
		...(await mp.evaluate(() => {
			const n = [...document.querySelectorAll('nav')].find((x) => x.getBoundingClientRect().height > 0 && getComputedStyle(x).display !== 'none');
			const vis = (e) => { for (let m = e; m && m.nodeType === 1; m = m.parentElement) { const cs = getComputedStyle(m); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
			const r = n?.getBoundingClientRect();
			return {
				openNavName: n?.getAttribute('data-framer-name'),
				openBox: r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null,
				text: n?.innerText,
				links: n ? [...n.querySelectorAll('a')].filter(vis).map((a) => ({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), top: Math.round(a.getBoundingClientRect().top) })).sort((a, b) => a.top - b.top) : [],
				closeIcon: n ? [...n.querySelectorAll('svg')].filter(vis).map((s) => s.outerHTML) : [],
			};
		})),
	};
}
await mp.screenshot({ path: path.join(RAW_DIR, 'mobile-menu-open.png') });
results.__mobileNav = mobileNav;
await fs.writeFile(path.join(RAW_DIR, '__mobile-nav.json'), JSON.stringify(mobileNav, null, 2));
await fs.writeFile(path.join(RAW_DIR, '__network.json'), JSON.stringify([...network], null, 2));
console.log('mobile nav:', JSON.stringify(mobileNav.links));
await browser.close();
