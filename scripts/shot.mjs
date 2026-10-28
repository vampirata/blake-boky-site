// node scripts/shot.mjs <url> <out.png> [width] [height] [fullPage]
import { chromium } from "playwright";
const [url, out, w = "1440", h = "900", full = ""] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "networkidle" });
if (full) {
	await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
	await p.waitForTimeout(800);
}
await p.waitForTimeout(2500);
await p.screenshot({ path: out, fullPage: !!full });
await b.close();
