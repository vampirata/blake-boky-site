// Accessibility (axe-core) and page-weight audit on one page per template, phone and desktop.
// Usage: node scripts/audit.mjs <baseUrl>
import { chromium } from "playwright";
import { createRequire } from "node:module";
const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const BASE = process.argv[2];
const PAGES = ["/", "/collections", "/collections/spirit-collection", "/collections/spirit-collection/angel-forces", "/collections/andromeda", "/collections/coming-soon-blake", "/past-works", "/past-works/the-story", "/news", "/news/sculptures_symbolisiing_hope", "/galleriespetley", "/galleriespetley/petley-jones", "/blake-bio", "/boky-bio", "/contact"];
const b = await chromium.launch();
const viol = {};
for (const [w, h, label] of [[390, 844, "phone"], [1440, 900, "desktop"]]) {
	const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
	for (const p of PAGES) {
		const page = await ctx.newPage();
		let bytes = 0, imgBytes = 0;
		page.on("response", async (r) => { const l = +(r.headers()["content-length"] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length; bytes += l; if (r.request().resourceType() === "image") imgBytes += l; });
		await page.goto(BASE + p, { waitUntil: "networkidle" });
		const lcp = await page.evaluate(() => new Promise((r) => { let v = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) v = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => r(Math.round(v)), 500); }));
		const cls = await page.evaluate(() => new Promise((r) => { let v = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value; }).observe({ type: "layout-shift", buffered: true }); setTimeout(() => r(+v.toFixed(3)), 500); }));
		await page.addScriptTag({ path: axePath });
		const res = await page.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes[0]?.target?.join(" ") })));
		for (const v of res) { const k = `${v.impact} ${v.id}`; (viol[k] ??= []).push(`${label} ${p} (${v.n}) e.g. ${v.ex}`); }
		console.log(`${label.padEnd(7)} ${p.padEnd(45)} load ${(bytes / 1e6).toFixed(2)} MB (img ${(imgBytes / 1e6).toFixed(2)})  LCP ${lcp}ms  CLS ${cls}`);
		await page.close();
	}
	await ctx.close();
}
await b.close();
console.log("\nAXE VIOLATIONS");
for (const [k, v] of Object.entries(viol)) console.log(k, v.length, "\n   ", v.slice(0, 4).join("\n    "));
