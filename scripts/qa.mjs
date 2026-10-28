// QA sweep: every page in the sitemap at phone, tablet, laptop, desktop and wide.
// Checks horizontal overflow, clipped text, console errors, failed requests,
// broken internal links, unloaded images and artwork cropped by object-fit cover.
// Usage: node scripts/qa.mjs http://localhost:4401 [pathFilter]
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = process.argv[2] ?? "http://localhost:4401";
const FILTER = process.argv[3] ?? "";
const WIDTHS = [
	[390, 844],
	[810, 1100],
	[1280, 800],
	[1440, 900],
	[1920, 1080],
];

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
	.map((m) => new URL(m[1]).pathname)
	.filter((p) => p.includes(FILTER));

const browser = await chromium.launch();
const report = [];
const linkSet = new Set();

for (const [w, h] of WIDTHS) {
	const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
	for (const path of paths) {
		const page = await ctx.newPage();
		const errors = [];
		const failed = [];
		page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
		page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
		page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${new URL(r.url()).pathname}`));
		await page.goto(BASE + path, { waitUntil: "networkidle" }).catch((e) => errors.push("goto " + e.message));
		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += 600) {
				window.scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 40));
			}
			window.scrollTo(0, 0);
			document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
		});
		await page.waitForLoadState("networkidle").catch(() => {});
		const res = await page.evaluate(() => {
			const cw = document.documentElement.clientWidth;
			const out = { overflow: document.documentElement.scrollWidth > cw + 1, clipped: [], broken: [], cover: [], links: [] };
			document.querySelectorAll("h1,h2,h3,h4,p,a,span,li,button,label").forEach((el) => {
				if (el.children.length && el.tagName !== "A") return;
				const t = el.textContent.trim();
				if (!t) return;
				const r = el.getBoundingClientRect();
				if (!r.width) return;
				if (r.right > cw + 2 && getComputedStyle(el).position !== "fixed") {
					let p = el.parentElement, scroller = false;
					while (p) { const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || p.hasAttribute("data-ticker")) { scroller = true; break; } p = p.parentElement; }
					if (!scroller) out.clipped.push("offscreen: " + t.slice(0, 40));
				}
				if (el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow === "hidden" && el.clientHeight > 0)
					out.clipped.push("cut: " + t.slice(0, 40));
			});
			document.querySelectorAll("img").forEach((i) => {
				if (!i.complete || i.naturalWidth === 0) out.broken.push(i.currentSrc || i.src);
				const cs = getComputedStyle(i);
				if (cs.objectFit === "cover" && i.naturalWidth) {
					const r = i.getBoundingClientRect();
					if (r.width < 2) return;
					const a = i.naturalWidth / i.naturalHeight, b = r.width / r.height;
					const cut = 1 - Math.min(a, b) / Math.max(a, b);
					if (cut > 0.05) out.cover.push(`${Math.round(cut * 100)}% ${i.closest("[class]")?.className.toString().slice(0, 40)} ${i.currentSrc.split("/").pop()}`);
				}
			});
			document.querySelectorAll("a[href]").forEach((a) => {
				const u = new URL(a.href, location.href);
				if (u.origin === location.origin) out.links.push(u.pathname);
				if (a.getAttribute("href") === "" || a.getAttribute("href") === "#") out.broken.push("empty href: " + a.textContent.trim().slice(0, 30));
			});
			return out;
		});
		res.links.forEach((l) => linkSet.add(l));
		delete res.links;
		const issues = { overflow: res.overflow, clipped: res.clipped.slice(0, 8), broken: res.broken.slice(0, 8), cover: res.cover.slice(0, 8), errors: errors.slice(0, 5), failed: failed.slice(0, 8) };
		const bad = issues.overflow || Object.values(issues).some((v) => Array.isArray(v) && v.length);
		if (bad) report.push({ w, path, ...issues });
		await page.close();
	}
	await ctx.close();
}

// Broken internal links
const dead = [];
for (const l of linkSet) {
	if (/\.(pdf|jpg|png|webp|svg|xml|txt)$/.test(l)) continue;
	const r = await fetch(BASE + l);
	if (r.status >= 400) dead.push(`${r.status} ${l}`);
}
await browser.close();
await writeFile(new URL("./.qa-report.json", import.meta.url), JSON.stringify({ dead, report }, null, 2));
console.log(`pages: ${paths.length} x ${WIDTHS.length} widths`);
console.log(`dead internal links: ${dead.length}`, dead.slice(0, 20));
console.log(`page/width combos with issues: ${report.length}`);
for (const r of report.slice(0, 60)) console.log(JSON.stringify(r));
