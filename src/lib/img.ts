import manifest from "./image-manifest.json";

type Entry = { w: number; h: number; variants: { w: number; src: string }[] };
const m = manifest as Record<string, Entry>;

/** Responsive data for an original "/assets/..." path. Falls back to the original. */
export function img(src: string | undefined | null) {
	if (!src) return null;
	const key = src.split("?")[0];
	const e = m[key];
	if (!e) return { src, srcset: undefined, width: undefined, height: undefined, ratio: undefined };
	const largest = e.variants[e.variants.length - 1];
	const mid = e.variants.find((v) => v.w >= 1600) ?? largest;
	return {
		src: mid.src,
		srcset: e.variants.map((v) => `${v.src} ${v.w}w`).join(", "),
		width: e.w,
		height: e.h,
		ratio: e.w / e.h,
	};
}
