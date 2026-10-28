// Remove full-size raster originals from the build; pages reference public/img variants.
import { readdir, rm } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/assets", import.meta.url));
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
let n = 0;
async function walk(dir) {
	for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
		const p = join(dir, e.name);
		if (e.isDirectory()) await walk(p);
		else if (RASTER.has(extname(e.name).toLowerCase())) {
			await rm(p);
			n++;
		}
	}
}
await walk(DIST);
console.log("postbuild: removed", n, "raster originals from dist/assets");
