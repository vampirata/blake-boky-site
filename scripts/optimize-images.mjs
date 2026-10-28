// Builds responsive WebP variants for every raster image in public/assets.
// Output: public/img/<same path without ext>-<w>.webp and src/lib/image-manifest.json.
// Originals stay in public/assets as the source of truth; scripts/postbuild.mjs
// drops them from dist so only the optimised variants ship.
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { join, relative, dirname, extname } from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "public/assets");
const OUT = join(ROOT, "public/img");
const WIDTHS = [480, 960, 1600, 2400];
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

async function* walk(dir) {
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) yield* walk(p);
		else if (RASTER.has(extname(e.name).toLowerCase())) yield p;
	}
}

const manifest = {};
const files = [];
for await (const f of walk(SRC)) files.push(f);

let done = 0;
async function one(file) {
	const rel = relative(join(ROOT, "public"), file); // assets/...
	const key = "/" + rel.split("\\").join("/");
	const base = join(OUT, relative(SRC, file)).replace(/\.[^.]+$/, "");
	await mkdir(dirname(base), { recursive: true });
	const img = sharp(file, { limitInputPixels: false }).rotate();
	const meta = await img.metadata();
	const swap = (meta.orientation ?? 1) >= 5;
	const w = swap ? meta.height : meta.width;
	const h = swap ? meta.width : meta.height;
	const widths = WIDTHS.filter((x) => x < w);
	widths.push(Math.min(w, 2400));
	const variants = [];
	for (const vw of [...new Set(widths)]) {
		const out = `${base}-${vw}.webp`;
		const exists = await stat(out).catch(() => null);
		if (!exists) {
			await sharp(file, { limitInputPixels: false })
				.rotate()
				.resize({ width: vw, withoutEnlargement: true })
				.webp({ quality: 82 })
				.toFile(out);
		}
		variants.push({ w: vw, src: "/" + relative(join(ROOT, "public"), out).split("\\").join("/") });
	}
	manifest[key] = { w, h, variants };
	if (++done % 50 === 0) console.log(done, "/", files.length);
}

const queue = [...files];
await Promise.all(
	Array.from({ length: 6 }, async () => {
		while (queue.length) await one(queue.shift());
	})
);

const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
await writeFile(join(ROOT, "src/lib/image-manifest.json"), JSON.stringify(sorted));
console.log("images:", files.length);
