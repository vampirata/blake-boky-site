// Decides how an image fills a fixed grid frame without cutting the artwork.
// 1. Cover when the crop only removes empty backdrop (subject box stays whole),
//    positioned around the subject.
// 2. Cover when the image is busy (a photo, not a plain backdrop) and the crop
//    is small (<= 12% of one side).
// 3. Otherwise contain, and fill the leftover space with the photo's own edge
//    colours (plain backdrops) or a soft blurred copy of the photo.
import analysis from "./image-analysis.json";

type A = {
	bg: { top: string; bottom: string; left: string; right: string; all: string };
	plain: boolean;
	dev: { top: number; bottom: number; left: number; right: number };
	box: [number, number, number, number];
};
const data = analysis as Record<string, A>;

export type Fill = { fit: "cover" | "contain"; pos: string; fill: string; blur: boolean; mask?: string };

const parse = (r: string) => {
	const [a, b] = r.split("/").map((v) => parseFloat(v));
	return b ? a / b : a;
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

export function smartFill(src: string, imgRatio: number | undefined, frame: string, fallbackBg?: string): Fill {
	const a = data[src.split("?")[0]];
	const R = parse(frame);
	if (!a || !imgRatio || !R) return { fit: "contain", pos: "50% 50%", fill: fallbackBg ?? "transparent", blur: false };
	const k = imgRatio / R;
	const [x0, y0, x1, y1] = a.box;
	const m = 0.015;
	if (k > 0.96 && k < 1.04) return { fit: "cover", pos: `${pct((x0 + x1) / 2)} ${pct((y0 + y1) / 2)}`, fill: a.bg.all, blur: false };

	const wide = k > 1; // image wider than frame: crop left/right (or bars top/bottom)
	const f = wide ? 1 / k : k; // visible fraction of the cropped axis
	const [s0, s1] = wide ? [x0, x1] : [y0, y1];
	const lo = clamp(s0 - m, 0, 1);
	const hi = clamp(s1 + m, 0, 1);
	const cover = (center: number) => {
		const start = clamp(center - f / 2, 0, 1 - f);
		const p = 1 - f > 0 ? start / (1 - f) : 0.5;
		return { fit: "cover" as const, pos: wide ? `${pct(p)} 50%` : `50% ${pct(p)}`, fill: a.bg.all, blur: false };
	};
	if (hi - lo <= f) return cover((lo + hi) / 2);
	if (!a.plain && 1 - f <= 0.12) return cover((s0 + s1) / 2);

	// Contain: bars sit on the axis that is NOT cropped. The image edges are
	// feathered into the fill so there is no visible seam.
	const a0 = ((1 - f) / 2) * 100;
	const a1 = 100 - a0;
	const fe = Math.min(4, f * 100 * 0.06);
	const mask = `linear-gradient(${wide ? "to bottom" : "to right"}, transparent ${a0.toFixed(2)}%, #000 ${(a0 + fe).toFixed(2)}%, #000 ${(a1 - fe).toFixed(2)}%, transparent ${a1.toFixed(2)}%)`;
	const [c1, c2, d1, d2] = wide
		? [a.bg.top, a.bg.bottom, a.dev.top, a.dev.bottom]
		: [a.bg.left, a.bg.right, a.dev.left, a.dev.right];
	if (Math.max(d1, d2) < 26) {
		const dir = wide ? "to bottom" : "to right";
		return { fit: "contain", pos: "50% 50%", fill: `linear-gradient(${dir}, ${c1} 50%, ${c2} 50%)`, blur: false, mask };
	}
	return { fit: "contain", pos: "50% 50%", fill: a.bg.all, blur: true, mask };
}
