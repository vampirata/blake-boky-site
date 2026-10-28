// Stage 2: turn the raw visible-DOM dumps from extract-pages.mjs into
// src/content/data/*.json, download every referenced asset (originals, no
// query strings) into public/assets/<area>/ and fonts into public/fonts/,
// then validate. Usage: node scripts/build-content.mjs [rawDir]
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ROOT = path.resolve('.');
const RAW = process.argv[2] || path.join(ROOT, 'scripts/.raw');
const DATA = path.join(ROOT, 'src/content/data');
const PUB = path.join(ROOT, 'public');
const HOST = 'blakeandboky.com';
await fs.mkdir(path.join(DATA, 'pages'), { recursive: true });

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const inScope = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => !p.startsWith('/collections'));
const rawName = (p) => (p === '/' ? 'home' : p.slice(1).replace(/\//g, '__'));
const raw = {};
for (const p of inScope) raw[p] = JSON.parse(await fs.readFile(path.join(RAW, rawName(p) + '.json'), 'utf8'));
const mobileNav = JSON.parse(await fs.readFile(path.join(RAW, '__mobile-nav.json'), 'utf8'));

const findings = { brokenLinks: [], emptyFields: [], placeholders: [], notes: [] };

// ---------- helpers ----------
const areaOf = (p) => (p === '/' ? 'home' : p.startsWith('/blake-bio') || p.startsWith('/boky-bio') ? 'bio' : p.startsWith('/contact') ? 'contact' : p.startsWith('/news') ? 'news' : p.startsWith('/past-works') ? 'past-works' : p.startsWith('/galleriespetley') ? 'galleries' : 'global');
const clean = (t) => (t == null ? t : t.replace(/ /g, ' '));
function toHref(absUrl, rawHref, page) {
	if (rawHref == null) return null;
	try {
		const u = new URL(absUrl ?? rawHref, `https://${HOST}${page}`);
		if (u.hostname === HOST) {
			let p = u.pathname.replace(/\/$/, '') || '/';
			return p + u.search + u.hash;
		}
		return u.href;
	} catch {
		return rawHref;
	}
}
let chromeCtx = null; // 'nav' | 'footer' while flattening global chrome
const seenFinding = new Set();
function checkLink(href, rawHref, page, ctx) {
	if (chromeCtx) { if (page !== '/') return; ctx = `${chromeCtx}: ${ctx}`; }
	const before = findings.brokenLinks.length;
	checkLink2(href, rawHref, page, ctx);
	if (findings.brokenLinks.length > before) {
		const k = JSON.stringify(findings.brokenLinks.at(-1));
		if (seenFinding.has(k)) findings.brokenLinks.pop(); else seenFinding.add(k);
	}
}
function checkLink2(href, rawHref, page, ctx) {
	if (rawHref == null) findings.brokenLinks.push({ page, ctx, problem: 'link has no href (null)' });
	else if (/^https?:\/\/(collections|news|past-works|contact|blake-bio|boky-bio)(\/|$)/.test(href)) findings.brokenLinks.push({ page, ctx, href, problem: 'malformed absolute URL (host is a page slug)' });
	else if (href.startsWith('/') && !href.startsWith('/collections') && !inScope.includes(href.split(/[?#]/)[0]) && href !== '/collections') findings.brokenLinks.push({ page, ctx, href, problem: 'internal path not in sitemap' });
	else if (href === page && !chromeCtx) findings.brokenLinks.push({ page, ctx, href, problem: 'links to itself (CMS link field probably empty)' });
}

// ---------- assets ----------
const assets = new Map(); // url -> {local, area, file}
function originalUrl(u) {
	if (!u || u.startsWith('data:')) return null;
	const url = new URL(u);
	if (/framerusercontent\.com$/.test(url.hostname)) return url.origin + url.pathname;
	return url.href;
}
function registerAsset(u, area, subdir = null) {
	const o = originalUrl(u);
	if (!o) return null;
	if (assets.has(o)) return assets.get(o).local;
	const file = decodeURIComponent(path.basename(new URL(o).pathname));
	const dir = subdir ?? `assets/${area}`;
	const local = `/${dir}/${file}`;
	assets.set(o, { local, area, file, dir });
	return local;
}
const imageMeta = new Map(); // local -> {w,h}

function imageRecord(it, area, extra = {}) {
	if (!it.src || it.src.startsWith('data:')) return { placeholder: true, src: null, alt: it.alt ?? '', rendered: { w: it.box.w, h: it.box.h } };
	const local = registerAsset(it.src, area);
	return { src: local, alt: clean(it.alt) ?? '', _orig: originalUrl(it.src), rendered: { w: it.box.w, h: it.box.h }, objectFit: it.objectFit, objectPosition: it.objectPosition, ...extra };
}

// ---------- generic section conversion ----------
const inside = (a, b, tol = 2) => a.x >= b.x - tol && a.y >= b.y - tol && a.x + a.w <= b.x + b.w + tol && a.y + a.h <= b.y + b.h + tol;
const HEAD = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
function flatten(sec, page) {
	const area = areaOf(page);
	const out0 = [];
	const out = { push: (o) => { o._id = cur.id; o._link = cur.linkId; out0.push(o); } };
	let cur;
	for (const it of sec.items) {
		cur = it;
		if (it.kind === 'richtext') {
			for (const b of it.blocks) {
				const links = b.links.map((l) => {
					const href = toHref(l.abs, l.href, page);
					checkLink(href, l.href, page, `inline link "${clean(l.text)}" in ${sec.name}`);
					return { text: clean(l.text), href };
				});
				out.push({ kind: 'text', role: it.name || null, tag: b.tag, text: clean(b.text), html: clean(b.html), links: links.length ? links : undefined, font: { family: b.font.family.split(',')[0].replace(/"/g, ''), size: b.font.size, weight: b.font.weight, transform: b.font.transform !== 'none' ? b.font.transform : undefined }, box: it.box, path: it.framerPath });
				for (const im of b.imgs) out.push({ kind: 'image', ...imageRecord({ src: im.src, alt: im.alt, box: it.box }, area), inline: true, box: it.box });
			}
		} else if (it.kind === 'text') {
			out.push({ kind: 'text', role: it.name || null, tag: it.tag, text: clean(it.text), plain: true, font: { family: it.font.family.split(',')[0].replace(/"/g, ''), size: it.font.size, weight: it.font.weight }, box: it.box, path: it.framerPath });
		} else if (it.kind === 'image') {
			out.push({ kind: 'image', ...imageRecord(it, area), name: it.name || null, box: it.box, path: it.framerPath });
		} else if (it.kind === 'bgimage') {
			for (const u of it.urls) {
				if (u.startsWith('data:')) { out.push({ kind: 'image', placeholder: true, src: null, note: 'Framer empty-image placeholder pattern (image field not set)', rendered: { w: it.box.w, h: it.box.h }, box: it.box, path: it.framerPath }); continue; }
				out.push({ kind: 'image', background: true, src: registerAsset(u, area), _orig: originalUrl(u), alt: '', rendered: { w: it.box.w, h: it.box.h }, objectFit: it.size === 'cover' ? 'cover' : it.size, objectPosition: it.position, box: it.box, path: it.framerPath });
			}
		} else if (it.kind === 'video') {
			out.push({ kind: 'video', src: registerAsset(it.src, area), poster: it.poster ? registerAsset(it.poster, area) : null, autoplay: it.autoplay, loop: it.loop, muted: it.muted, controls: it.controls, objectFit: it.objectFit, rendered: { w: it.box.w, h: it.box.h }, box: it.box });
		} else if (it.kind === 'iframe') {
			out.push({ kind: 'embed', src: it.src, title: it.title, rendered: { w: it.box.w, h: it.box.h }, box: it.box });
		} else if (it.kind === 'link') {
			const href = toHref(it.abs, it.href, page);
			checkLink(href, it.href, page, `link "${clean(it.text) || '(image)'}" in ${sec.name}`);
			out.push({ kind: 'link', text: clean(it.text), href, target: it.target || undefined, box: it.box, zeroBox: it.zeroBox, path: it.framerPath });
		} else if (it.kind === 'svg') {
			out.push({ kind: 'svg', svg: it.svg, name: it.name, rendered: { w: it.box.w, h: it.box.h }, box: it.box });
		} else if (it.kind === 'field' || it.kind === 'button' || it.kind === 'form') {
			out.push({ ...it, framerPath: undefined, box: it.box });
		}
	}
	return out0;
}

const svgFiles = new Map(); // hash -> local
function saveSvg(svg, hint) {
	if (!svg) return null;
	const h = crypto.createHash('sha1').update(svg).digest('hex').slice(0, 10);
	if (!svgFiles.has(h)) svgFiles.set(h, { local: `/assets/global/icon-${(hint || 'svg').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${h}.svg`, svg });
	return svgFiles.get(h).local;
}

const TYPE_BY_NAME = {
	'Hero Main': 'hero-collage', Hero: 'hero', Arrive: 'page-title', 'About the Artists': 'artists-intro', 'Fullscreen Section': 'full-bleed-image',
	Desktop: 'contact-cta-banner', 'Contact CTA': 'contact-cta', Portrait: 'image', Details: 'contact-details', Message: 'contact-form',
	'Artist Statement': 'quote', Biography: 'biography-timeline', Collections: 'card-grid', Exhibitions: 'exhibitions', 'Artnet Feature': 'feature',
	'Gallery Partners': 'card-grid', Introduction: 'text', 'Installation Views': 'image-grid', Visit: 'text', Dark: 'back-link', Light: 'back-link',
	'Blog Posts': 'card-grid', Wrap: 'content', 'Image Section': 'image', Article: 'article', Links: 'prev-next', Image: 'image', Info: 'text',
};
function sectionType(sec, flat) {
	const imgs = flat.filter((x) => x.kind === 'image').length;
	const cards = flat.filter((x) => x.kind === 'link' && flat.some((y) => y !== x && y.kind === 'image' && inside(y.box, x.box))).length;
	if (sec.name === 'Section') {
		if (flat.some((x) => x.kind === 'text' && x.plain && /^\d+$/.test(x.text.trim()))) return 'stats';
		if (cards >= 2) return 'card-grid';
		if (flat.filter((x) => x.kind === 'link').length === 1 && !imgs) return 'section-link';
	}
	if (sec.name === 'Collections' && cards < 2) return 'list';
	return TYPE_BY_NAME[sec.name] || (cards >= 2 ? 'card-grid' : imgs >= 3 ? 'image-grid' : imgs ? 'media' : 'text');
}
const strip = (o) => { const { box, path: p, _orig, font, _id, _link, ...rest } = o; return rest; };
const stripKeepFont = (o) => { const { box, path: p, _orig, _id, _link, ...rest } = o; return rest; };

function convertSection(sec, page) {
	const flat = flatten(sec, page);
	const type = sectionType(sec, flat);
	const texts = flat.filter((x) => x.kind === 'text');
	// cards: links that contain other items
	const linkItems = flat.filter((x) => x.kind === 'link');
	const cards = [];
	const used = new Set();
	for (const l of linkItems) {
		const kids = flat.filter((y) => y !== l && y.kind !== 'link' && y.kind !== 'svg' && y._link != null && y._link === l._id);
		if (!kids.length) continue;
		kids.forEach((k) => used.add(k));
		cards.push({
			href: l.href, target: l.target, label: l.text,
			image: (() => { const i = kids.find((k) => k.kind === 'image'); return i ? strip(i) : null; })(),
			texts: kids.filter((k) => k.kind === 'text').map((k) => ({ role: k.role, tag: k.tag, text: k.text })),
		});
	}
	const free = texts.filter((x) => !used.has(x) && !(type === 'stats' && x.plain));
	const headingItem = free.find((x) => HEAD.includes(x.tag)) || free.find((x) => parseFloat(x.font.size) >= 40);
	const eyebrow = texts.find((x) => x.role === 'Eyebrow' || (x !== headingItem && x.text === x.text.toUpperCase() && /[A-Z]/.test(x.text) && x.text.length < 60 && !used.has(x) && texts.indexOf(x) < texts.indexOf(headingItem)));
	const body = texts.filter((x) => x !== headingItem && x !== eyebrow && !used.has(x) && x.text.trim());
	const media = flat.filter((x) => x.kind === 'image' || x.kind === 'video' || x.kind === 'embed').map(strip);
	const links = linkItems.map((l) => ({ text: l.text, href: l.href, target: l.target }));
	for (const t of texts) for (const l of t.links || []) links.push({ ...l, inline: true });
	const icons = flat.filter((x) => x.kind === 'svg').map((s) => ({ src: saveSvg(s.svg, s.name || 'icon'), rendered: s.rendered }));
	const out = {
		type, name: sec.name, tag: sec.tag,
		box: { y: sec.box.y, h: sec.box.h },
		eyebrow: eyebrow?.text ?? null,
		heading: headingItem ? { tag: headingItem.tag, text: headingItem.text } : null,
		body: body.map((x) => ({ role: x.role, tag: x.tag, text: x.text, html: x.html ?? undefined })),
		media, links,
	};
	if (cards.length) out.cards = cards;
	if (type === 'stats') {
		const stats = [];
		let acc = [];
		for (const x of flat) {
			if (x.kind === 'text' && x.plain) acc.push(x.text.trim());
			else if (x.kind === 'text') { stats.push({ value: acc.find((t) => /\d/.test(t)) ?? null, suffix: acc.filter((t) => !/\d/.test(t)).join('') || null, label: x.text }); acc = []; }
		}
		out.stats = stats;
		out.statsNote = 'Numbers are plain text spans (likely animated counters); values captured after scrolling, i.e. final values.';
	}
	if (icons.length) out.icons = icons;
	const fields = flat.filter((x) => ['field', 'button', 'form'].includes(x.kind));
	if (fields.length) out.form = fields;
	out.content = flat.map((x) => (x.kind === 'svg' ? { kind: 'svg', src: saveSvg(x.svg, x.name || 'icon') } : stripKeepFont(x)));
	return out;
}

const isChrome = (s) => s.tag === 'nav' || s.tag === 'footer';
function pageSections(p) {
	return raw[p].sections.filter((s) => !isChrome(s)).sort((a, b) => a.box.y - b.box.y || a.index - b.index).filter((s) => !(s.tag === 'a' && (s.name === 'Dark' || s.name === 'Light') && s.box.y < 150) || true);
}
const navVariant = (p) => raw[p].sections.find((s) => s.tag === 'nav')?.name ?? null;
const seoOf = (p) => {
	const s = raw[p].seo;
	const og = s.ogImage ? registerAsset(s.ogImage, 'global') : null;
	if (/\{\{.*\}\}/.test(s.title)) findings.placeholders.push({ page: p, field: 'seo.title', value: s.title });
	return { title: s.title, description: s.description, ogTitle: s.ogTitle, ogDescription: s.ogDescription, ogImage: og, canonical: s.canonical };
};

// Pre-register CMS detail images so each lands in its own area folder (first registration wins).
for (const p of inScope.filter((x) => x.split('/').length > 2)) for (const sec of raw[p].sections) if (!isChrome(sec)) for (const it of sec.items) {
	if (it.kind === 'image') registerAsset(it.src, areaOf(p));
	if (it.kind === 'richtext') for (const b of it.blocks) for (const im of b.imgs) registerAsset(im.src, areaOf(p));
}
// ---------- static pages ----------
const STATIC = { '/': 'home', '/blake-bio': 'blake-bio', '/boky-bio': 'boky-bio', '/contact': 'contact', '/news': 'news', '/past-works': 'past-works', '/galleriespetley': 'galleriespetley' };
const pagesOut = {};
for (const [p, name] of Object.entries(STATIC)) {
	pagesOut[name] = { path: p, seo: seoOf(p), navVariant: navVariant(p), bodyBackground: raw[p].bodyBg, scrollHeight: raw[p].scrollHeight, sections: pageSections(p).map((s) => convertSection(s, p)) };
}

// contact form details
{
	const c = pagesOut.contact;
	const msg = c.sections.find((s) => s.form);
	const fields = msg.form.filter((f) => f.kind === 'field');
	let selectOptions = null;
	try {
		const txt = await fs.readFile(path.join(RAW, '__contact-select-options.txt'), 'utf8');
		const arr = txt.trim().replace(/^selectOptions:/, '').replace(/`/g, '"').replace(/([{,])(\w+):/g, '$1"$2":');
		selectOptions = JSON.parse(arr).map((o) => (o.type === 'divider' ? { divider: o.title } : { value: o.value, label: o.title }));
	} catch (e) { findings.notes.push('could not parse select options from JS bundle: ' + e.message); }
	c.form = {
		name: msg.form.find((f) => f.kind === 'form')?.name ?? null,
		method: 'POST',
		action: 'https://api.framer.com/forms/v1/forms/3eb57677-3c73-4469-885a-804fb17280c9/submit',
		actionSource: 'Framer Forms endpoint, read from the page JS bundle (FormContainer action prop); not visible in the DOM. Not submitted during extraction.',
		fields: fields.filter((f) => f.autocomplete !== 'one-time-code').map((f) => ({
			name: f.fieldName, tag: f.tag, type: f.type, label: f.label ?? (f.tag === 'select' ? 'PIECE INTERESTED IN' : null), placeholder: f.placeholder ?? null, required: f.required,
			...(f.tag === 'select' ? { options: selectOptions ?? f.options } : {}),
		})),
		honeypotFields: fields.filter((f) => f.autocomplete === 'one-time-code').map((f) => f.fieldName),
		submit: { label: msg.form.find((f) => f.kind === 'button')?.text ?? null, type: 'submit' },
		note: msg.body.find((b) => b.role === 'Note')?.text ?? null,
	};
}

// ---------- site.json: nav, footer, fonts, favicon ----------
const homeNav = raw['/'].sections.find((s) => s.tag === 'nav');
chromeCtx = 'nav';
const navFlat = flatten(homeNav, '/');
chromeCtx = null;
const navLinks = navFlat.filter((x) => x.kind === 'link');
const logoLink = navLinks[0];
const mob = mobileNav.links.map((l, i) => ({ label: l.text, href: toHref(null, l.href, '/'), order: i + 1 }));
const desktopItems = navLinks.slice(1).map((l, i) => ({ label: l.text.trim(), labelRaw: l.text, href: l.href, order: i + 1 }));
const navItems = [];
for (const m of mob) {
	const d = desktopItems.find((x) => x.href === m.href);
	navItems.push({ href: m.href, desktop: !!d, desktopLabel: d?.label ?? null, desktopOrder: d?.order ?? null, mobile: true, mobileLabel: m.label, mobileOrder: m.order });
}
for (const d of desktopItems) if (!navItems.find((n) => n.href === d.href)) navItems.push({ href: d.href, desktop: true, desktopLabel: d.label, desktopOrder: d.order, mobile: false, mobileLabel: null, mobileOrder: null });
navItems.sort((a, b) => (a.desktopOrder ?? 0) - (b.desktopOrder ?? 0));

const footerSec = raw['/'].sections.find((s) => s.tag === 'footer');
chromeCtx = 'footer';
const ff = flatten(footerSec, '/');
const columns = [];
for (const t of ff) {
	if (t.kind === 'text' && /^\[.*\]$/.test(t.text.trim())) columns.push({ title: t.text.trim(), links: [] });
	else if (t.kind === 'link' && columns.length && t.path.includes('Links')) columns[columns.length - 1].links.push({ label: t.text, href: t.href, target: t.target });
}
const footerTexts = ff.filter((x) => x.kind === 'text').map((x) => ({ tag: x.tag, text: x.text, font: x.font }));
const footer = {
	variantName: footerSec.name,
	columns,
	brand: footerTexts.find((x) => x.tag === 'h2')?.text ?? null,
	contactLink: (() => { const l = ff.find((x) => x.kind === 'link' && /contact/i.test(x.text) && !x.path.includes('Links')); return l ? { label: l.text, href: l.href } : null; })(),
	copyright: footerTexts.find((x) => /copyright/i.test(x.text))?.text ?? null,
	allText: footerTexts.map((x) => x.text),
	icons: ff.filter((x) => x.kind === 'svg').map((s) => saveSvg(s.svg, 'footer-arrow')),
};
// footer identical on all pages?
const footerSig = (p) => JSON.stringify(flatten(raw[p].sections.find((s) => s.tag === 'footer'), p).filter((x) => x.kind !== 'svg').map((x) => x.text + '|' + (x.href ?? '')));
const footerDiff = inScope.filter((p) => footerSig(p) !== footerSig('/'));
chromeCtx = null;
if (footerDiff.length) findings.notes.push('footer differs on: ' + footerDiff.join(', '));

// fonts
const usedFamilies = new Set();
const usedWeights = {};
for (const p of inScope) for (const s of raw[p].sections) for (const it of s.items) {
	const fonts = it.kind === 'richtext' ? it.blocks.map((b) => b.font) : it.font ? [it.font] : [];
	for (const f of fonts) { const fam = f.family.split(',')[0].replace(/"/g, '').trim(); usedFamilies.add(fam); (usedWeights[fam] ??= new Set()).add(`${f.weight}`); }
}
const faces = [];
const seenFace = new Set();
for (const f of raw['/'].fontFaces) {
	if (/Placeholder/.test(f.family)) continue;
	const urls = [...f.src.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]);
	const key = f.family + f.weight + f.style + f.unicodeRange + urls.join();
	if (seenFace.has(key)) continue;
	seenFace.add(key);
	const used = usedFamilies.has(f.family);
	const files = urls.map((u) => {
		const h = new URL(u).hostname;
		if (used && (h.endsWith('framerusercontent.com') || h === 'fonts.gstatic.com')) return { url: u, local: registerAsset(u, null, `fonts/${f.family.toLowerCase().replace(/\s+/g, '-')}`) };
		return { url: u, local: null };
	});
	faces.push({ family: f.family, weight: f.weight, style: f.style, unicodeRange: f.unicodeRange || null, used, files });
}
const favicon = raw['/'].icons.map((i) => ({ rel: i.rel, media: i.media, href: registerAsset(i.href, 'global'), sizes: i.sizes }));

const site = {
	source: `https://${HOST}`,
	extractedAt: new Date().toISOString(),
	logo: { type: 'text', text: clean(logoLink?.text), href: logoLink?.href, font: navFlat.find((x) => x.kind === 'text')?.font, note: 'The logo is live text in the nav (no SVG or image logo on the site).' },
	favicon,
	nav: {
		items: navItems,
		desktopOrder: desktopItems.map((d) => d.label),
		mobileOrder: mob.map((m) => m.label),
		mobileTrigger: mobileNav.triggerName,
		mobileOpenVariant: mobileNav.openNavName,
		mobileCloseIcon: (mobileNav.closeIcon || []).map((s) => saveSvg(s, 'menu-close')),
		variantsByPage: Object.fromEntries(inScope.map((p) => [p, navVariant(p)])),
	},
	footer,
	fonts: {
		families: [...usedFamilies].map((f) => ({ family: f, weightsInUse: [...usedWeights[f]].sort() })),
		faces,
		unusedFacesDeclared: [...new Set(faces.filter((f) => !f.used).map((f) => f.family))],
	},
	pageBackgrounds: Object.fromEntries(inScope.map((p) => [p, raw[p].bodyBg])),
};

// ---------- CMS ----------
const textAt = (flat, pred) => flat.find((x) => x.kind === 'text' && pred(x));
function indexCards(p, secName) {
	const sec = pagesOut[STATIC[p]].sections.find((s) => s.name === secName && s.cards);
	return sec.cards;
}
// Past works
const pastWorks = [];
for (const [i, card] of indexCards('/past-works', 'Wrap').entries()) {
	const p = card.href;
	const r = raw[p];
	const sec = r.sections.find((s) => s.name === 'Wrap');
	const flat = flatten(sec, p);
	const texts = flat.filter((x) => x.kind === 'text');
	const meta = [];
	const metaTexts = texts.filter((x) => x.path.includes('Meta'));
	for (let k = 0; k < metaTexts.length; k += 2) meta.push({ label: metaTexts[k].text, value: metaTexts[k + 1]?.text ?? null });
	const hero = flat.find((x) => x.kind === 'image' && (x.path?.includes('Hero Image') || x.placeholder));
	const body = [];
	let sourceLabel = null;
	for (const x of flat) {
		if (x.kind === 'text' && x.font.size === '17px') body.push({ type: 'p', text: x.text, html: x.html, weight: x.font.weight });
		else if (x.kind === 'image' && x !== hero) body.push({ type: 'image', ...strip(x) });
		else if (x.kind === 'text' && x.font.size === '13px') sourceLabel = x.text;
	}
	const ext = flat.find((x) => x.kind === 'link' && x.target === '_blank');
	const back = r.sections.find((s) => s.tag === 'a' && (s.name === 'Dark' || s.name === 'Light'));
	const backFlat = back ? flatten(back, p) : [];
	const item = {
		slug: p.split('/').pop(), path: p, order: i + 1,
		title: texts.find((x) => x.font.size === '66px')?.text ?? null,
		cardTitle: card.texts.find((t) => t.role === 'Title')?.text ?? card.label,
		cardImage: card.image,
		artist: texts[0]?.text ?? null,
		meta,
		year: meta.find((m) => m.label === 'YEAR')?.value ?? null,
		medium: meta.find((m) => m.label === 'MEDIUM')?.value ?? null,
		heroImage: hero ? strip(hero) : null,
		body,
		sourceLabel,
		externalLink: ext ? { label: ext.text, href: ext.href } : null,
		backLink: backFlat.find((x) => x.kind === 'link') ? { label: backFlat.find((x) => x.kind === 'link').text, href: backFlat.find((x) => x.kind === 'link').href } : null,
		seo: seoOf(p),
	};
	if (!item.heroImage || item.heroImage.placeholder) findings.emptyFields.push({ page: p, field: 'heroImage', note: 'empty; Framer shows its striped placeholder' });
	if (!item.sourceLabel) findings.emptyFields.push({ page: p, field: 'sourceLabel', note: 'no "bokysculpture.com" source line on this item' });
	if (!item.externalLink) findings.emptyFields.push({ page: p, field: 'externalLink', note: 'no "View original" link' });
	for (const b of body) if (b.type === 'p' && /pending|add the hosted link/i.test(b.text)) findings.placeholders.push({ page: p, field: 'body', value: b.text });
	pastWorks.push(item);
}
// News
const news = [];
for (const [i, card] of indexCards('/news', 'Blog Posts').entries()) {
	const p = card.href;
	const r = raw[p];
	const secs = r.sections.filter((s) => !isChrome(s));
	const flatAll = Object.fromEntries(secs.map((s) => [s.name, flatten(s, p)]));
	const art = flatAll['Article'] || [];
	const date = art.find((x) => x.kind === 'text' && x.role !== 'Content')?.text ?? null;
	const body = [];
	for (const x of art) {
		if (x.kind === 'text' && x.role === 'Content') body.push({ type: 'block', tag: x.tag, html: x.html, text: x.text, empty: !x.text.trim() || undefined, links: x.links });
		else if (x.kind === 'image') body.push({ type: 'image', ...strip(x) });
		else if (x.kind === 'embed' || x.kind === 'video') body.push({ type: x.kind, ...strip(x) });
	}
	const linksFlat = flatAll['Links'] || [];
	const pn = (role) => {
		const t = linksFlat.find((x) => x.kind === 'text' && x.role === role);
		if (!t) return null;
		const thumb = linksFlat.find((x) => x.kind === 'image' && x.path.includes(role));
		return { title: t.text, href: t.links?.[0]?.href ?? null, thumb: thumb ? strip(thumb) : null };
	};
	const hero = (flatAll['Image Section'] || []).find((x) => x.kind === 'image');
	const item = {
		slug: p.split('/').pop(), path: p, order: i + 1,
		title: (flatAll['Arrive'] || []).find((x) => x.kind === 'text')?.text ?? null,
		cardTitle: card.texts.find((t) => t.role === 'Title')?.text ?? null,
		date,
		cardDate: card.texts.find((t) => t.role === 'Date')?.text ?? null,
		author: null,
		category: null,
		cardImage: card.image,
		heroImage: hero ? strip(hero) : null,
		body,
		previous: pn('Previous'),
		next: pn('Next'),
		backLink: (() => { const b = secs.find((s) => s.tag === 'a'); const l = b && flatten(b, p).find((x) => x.kind === 'link'); return l ? { label: l.text, href: l.href } : null; })(),
		seo: seoOf(p),
	};
	news.push(item);
}
findings.notes.push('News: no author or category is rendered anywhere on the index or detail pages; fields left null.');
// Galleries
const galleries = [];
for (const [i, card] of indexCards('/galleriespetley', 'Gallery Partners').entries()) {
	const p = card.href;
	const r = raw[p];
	const secs = r.sections.filter((s) => !isChrome(s));
	const F = Object.fromEntries(secs.map((s) => [s.name, flatten(s, p)]));
	const hero = (F['Image'] || []).find((x) => x.kind === 'image');
	const info = F['Info'] || [];
	const content = info.filter((x) => x.kind === 'text' && x.role === 'Content').map((x) => ({ tag: x.tag, html: x.html, text: x.text, empty: !x.text.trim() || undefined }));
	const extLinks = info.filter((x) => x.kind === 'text' && /^Link/.test(x.role || '')).map((x) => ({ slot: x.role, label: x.text, href: x.links?.[0]?.href ?? null }));
	const cta = F['Contact CTA'] || [];
	const item = {
		slug: p.split('/').pop(), path: p, order: i + 1,
		title: (F['Hero'] || []).find((x) => x.role === 'Title')?.text ?? null,
		eyebrow: (F['Hero'] || []).find((x) => x.role === 'Eyebrow')?.text ?? null,
		cardTitle: card.texts.find((t) => HEAD.includes(t.tag))?.text ?? null,
		date: card.texts.find((t) => /\d{4}/.test(t.text) && !HEAD.includes(t.tag))?.text ?? null,
		cardImage: card.image,
		heroImage: hero ? strip(hero) : null,
		content,
		externalLinks: extLinks,
		cta: { heading: cta.find((x) => x.role === 'Heading')?.text ?? null, link: (() => { const l = cta.find((x) => x.kind === 'link'); return l ? { label: l.text, href: l.href } : null; })() },
		backLink: (() => { const b = secs.find((s) => s.tag === 'a'); const l = b && flatten(b, p).find((x) => x.kind === 'link'); return l ? { label: l.text, href: l.href } : null; })(),
		seo: seoOf(p),
	};
	if (!content.some((c) => c.text.trim())) findings.emptyFields.push({ page: p, field: 'content', note: 'no body text' });
	for (const c of content) if (/^h+$/i.test(c.text.trim())) findings.placeholders.push({ page: p, field: 'content', value: c.text });
	galleries.push(item);
}

// ---------- download assets ----------
const sizeOf = async (f) => (await fs.stat(f)).size;
async function download(url, dest) {
	if (fss.existsSync(dest) && (await sizeOf(dest)) > 0) return 'cached';
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	await fs.mkdir(path.dirname(dest), { recursive: true });
	await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
	return 'downloaded';
}
let failed = [];
const queue = [...assets.entries()];
await Promise.all(Array.from({ length: 8 }, async () => {
	while (queue.length) {
		const [url, a] = queue.shift();
		try { await download(url, path.join(PUB, a.local)); } catch (e) { failed.push({ url, error: e.message }); }
	}
}));
for (const [h, s] of svgFiles) {
	await fs.mkdir(path.join(PUB, 'assets/global'), { recursive: true });
	await fs.writeFile(path.join(PUB, s.local), s.svg.replace(/^<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"'));
}
// PDFs linked from content (download if < 60 MB)
const pdfs = [];
for (const it of pastWorks) {
	const href = it.externalLink?.href;
	if (href && /\.pdf($|\?)/i.test(href)) {
		const head = await fetch(href, { method: 'HEAD' });
		const len = +head.headers.get('content-length') || 0;
		const rec = { url: href, bytes: len, status: head.status, local: null };
		if (head.ok && len < 60e6) {
			const local = `/assets/past-works/${decodeURIComponent(path.basename(new URL(href).pathname))}`;
			await download(href, path.join(PUB, local));
			rec.local = local;
			it.externalLink.local = local;
		}
		pdfs.push(rec);
	}
}

// image metadata + crop detection
for (const [, a] of assets) {
	const f = path.join(PUB, a.local);
	if (!fss.existsSync(f) || !/\.(jpe?g|png|webp|gif|avif|svg)$/i.test(f)) continue;
	try { const m = await sharp(f).metadata(); imageMeta.set(a.local, { w: m.width, h: m.height, bytes: (await fs.stat(f)).size }); } catch {}
}
let croppedCount = 0;
const croppedList = [];
const imgSeen = new Set();
function finalizeImages(node, ctx) {
	if (Array.isArray(node)) { node.forEach((n) => finalizeImages(n, ctx)); return; }
	if (!node || typeof node !== 'object') return;
	if ('src' in node && 'rendered' in node && ('objectFit' in node || node.placeholder)) {
		const m = node.src ? imageMeta.get(node.src) : null;
		if (m) {
			node.naturalWidth = m.w; node.naturalHeight = m.h;
			const ar = m.w / m.h, br = node.rendered.w / node.rendered.h;
			node.cropped = (node.objectFit === 'cover' || node.objectFit === 'auto' && node.background) ? Math.abs(br / ar - 1) > 0.05 : false;
			if (node.cropped) {
				node.cropRatio = Math.round((br / ar) * 1000) / 1000;
				const k = ctx + '|' + node.src + '|' + node.rendered.w + 'x' + node.rendered.h;
				if (!imgSeen.has(k)) { imgSeen.add(k); croppedCount++; croppedList.push({ ctx, src: node.src, natural: `${m.w}x${m.h}`, box: `${node.rendered.w}x${node.rendered.h}`, ratio: node.cropRatio }); }
			}
		}
		// reorder keys for readability
		const { src, alt, naturalWidth, naturalHeight, rendered, objectFit, objectPosition, cropped, cropRatio, ...rest } = node;
		for (const k of Object.keys(node)) delete node[k];
		Object.assign(node, { src, alt, naturalWidth, naturalHeight, rendered, objectFit, objectPosition, cropped, cropRatio, ...rest });
	}
	for (const v of Object.values(node)) finalizeImages(v, ctx);
}
for (const [n, pg] of Object.entries(pagesOut)) finalizeImages(pg, pg.path);
pastWorks.forEach((x) => finalizeImages(x, x.path));
news.forEach((x) => finalizeImages(x, x.path));
galleries.forEach((x) => finalizeImages(x, x.path));
finalizeImages(site, 'site');

// ---------- write ----------
const W = (f, d) => fs.writeFile(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n', 'utf8');
await W('site.json', site);
for (const [n, pg] of Object.entries(pagesOut)) await W(`pages/${n}.json`, pg);
await W('past-works.json', pastWorks);
await W('news.json', news);
await W('galleries.json', galleries);
await fs.writeFile(path.join(RAW, '__findings.json'), JSON.stringify({ ...findings, croppedList, pdfs, failed }, null, 2));

// ---------- validate ----------
const represented = new Set([...Object.keys(STATIC), ...pastWorks.map((x) => x.path), ...news.map((x) => x.path), ...galleries.map((x) => x.path)]);
const missingPages = inScope.filter((p) => !represented.has(p));
const allJson = [await fs.readFile(path.join(DATA, 'site.json'), 'utf8'), ...(await Promise.all(Object.keys(pagesOut).map((n) => fs.readFile(path.join(DATA, `pages/${n}.json`), 'utf8')))), ...(await Promise.all(['past-works', 'news', 'galleries'].map((n) => fs.readFile(path.join(DATA, `${n}.json`), 'utf8'))))].join('\n');
const refs = new Set([...allJson.matchAll(/"(\/(?:assets|fonts)\/[^"]+)"/g)].map((m) => m[1]));
const missingAssets = [...refs].filter((r) => !fss.existsSync(path.join(PUB, r)));
let bytes = 0, files = 0;
const walk = async (d) => { for (const e of await fs.readdir(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) await walk(f); else { bytes += (await fs.stat(f)).size; files++; } } };
for (const a of ['home', 'bio', 'contact', 'news', 'past-works', 'galleries', 'global']) if (fss.existsSync(path.join(PUB, 'assets', a))) await walk(path.join(PUB, 'assets', a));
const assetBytes = bytes, assetFiles = files;
bytes = 0; files = 0;
if (fss.existsSync(path.join(PUB, 'fonts'))) await walk(path.join(PUB, 'fonts'));
console.log(JSON.stringify({
	sitemapInScope: inScope.length, represented: represented.size, missingPages,
	staticPages: Object.keys(pagesOut).length, pastWorks: pastWorks.length, news: news.length, galleries: galleries.length,
	assetsReferenced: refs.size, missingAssets, downloadFailures: failed,
	assetFiles, assetMB: +(assetBytes / 1e6).toFixed(2), fontFiles: files, fontMB: +(bytes / 1e6).toFixed(2),
	svgIcons: svgFiles.size, croppedImages: croppedCount, pdfs,
	brokenLinks: findings.brokenLinks.length, emptyFields: findings.emptyFields.length, placeholders: findings.placeholders.length,
}, null, 2));
