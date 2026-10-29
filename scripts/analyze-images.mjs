// For every raster image: the background colour along each edge, whether the
// background is a plain studio backdrop, and the subject's bounding box
// (pixels that differ from the backdrop). Img.astro uses this to fill grid
// cells without ever cutting into the artwork. Output: src/lib/image-analysis.json
import { readdir, writeFile } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "public/assets");
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const N = 96; // analysis size

async function* walk(dir) {
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) yield* walk(p);
		else if (RASTER.has(extname(e.name).toLowerCase())) yield p;
	}
}
const median = (arr) => {
	const s = [...arr].sort((a, b) => a - b);
	return s[Math.floor(s.length / 2)];
};
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

async function analyze(file) {
	const { data, info } = await sharp(file, { limitInputPixels: false })
		.rotate()
		.flatten({ background: "#ffffff" })
		.resize(N, N, { fit: "fill" })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const ch = info.channels;
	const px = (x, y) => {
		const i = (y * N + x) * ch;
		return [data[i], data[i + 1], data[i + 2]];
	};
	const ring = (pts) => {
		const c = [0, 1, 2].map((k) => median(pts.map((p) => p[k])));
		const dev = Math.sqrt(pts.reduce((a, p) => a + (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2, 0) / pts.length / 3);
		return { c, dev };
	};
	const side = (fn) => ring(Array.from({ length: N }, (_, i) => fn(i, 0)));
	const top = side((i, d) => px(i, d));
	const bottom = side((i, d) => px(i, N - 1 - d));
	const left = side((i, d) => px(d, i));
	const right = side((i, d) => px(N - 1 - d, i));
	const all = ring([...Array(N).keys()].flatMap((i) => [px(i, 0), px(i, N - 1), px(0, i), px(N - 1, i)]));
	const plain = [top, bottom, left, right].every((s) => s.dev < 14);

	// Subject box: pixels far from the nearest edge colour (blend top/bottom by row).
	const rows = new Array(N).fill(0);
	const cols = new Array(N).fill(0);
	for (let y = 0; y < N; y++) {
		const t = y / (N - 1);
		const bg = [0, 1, 2].map((k) => top.c[k] * (1 - t) + bottom.c[k] * t);
		for (let x = 0; x < N; x++) {
			const p = px(x, y);
			const d = Math.sqrt((p[0] - bg[0]) ** 2 + (p[1] - bg[1]) ** 2 + (p[2] - bg[2]) ** 2);
			if (d > 34) {
				rows[y]++;
				cols[x]++;
			}
		}
	}
	const span = (a) => {
		const min = Math.max(1, Math.round(N * 0.015));
		let s = a.findIndex((v) => v >= min);
		let e = a.length - 1 - [...a].reverse().findIndex((v) => v >= min);
		if (s < 0) return [0, 1];
		return [s / N, (e + 1) / N];
	};
	const [x0, x1] = span(cols);
	const [y0, y1] = span(rows);
	return {
		bg: { top: hex(top.c), bottom: hex(bottom.c), left: hex(left.c), right: hex(right.c), all: hex(all.c) },
		plain,
		dev: { top: Math.round(top.dev), bottom: Math.round(bottom.dev), left: Math.round(left.dev), right: Math.round(right.dev) },
		box: [x0, y0, x1, y1].map((v) => +v.toFixed(3)),
	};
}

const out = {};
const files = [];
for await (const f of walk(SRC)) files.push(f);
await Promise.all(
	Array.from({ length: 6 }, async () => {
		while (files.length) {
			const f = files.shift();
			out["/" + relative(join(ROOT, "public"), f).split("\\").join("/")] = await analyze(f);
		}
	})
);
const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
await writeFile(join(ROOT, "src/lib/image-analysis.json"), JSON.stringify(sorted));
const vals = Object.values(sorted);
console.log("analyzed", vals.length, "plain backdrops", vals.filter((v) => v.plain).length);
