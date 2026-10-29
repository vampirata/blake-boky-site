// Primary buttons lean a few pixels toward the pointer and ease home on leave.
// Uses the independent `translate` property so it never fights a component's
// own transform. Desktop pointer only (see motion.ts).
const SEL = ".btn-outline, [data-magnetic]";
const PULL_X = 7;
const PULL_Y = 5;

export function initMagnetic() {
	document.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
		let frame = 0;
		let tx = 0;
		let ty = 0;
		const paint = () => {
			frame = 0;
			el.style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
		};
		el.addEventListener("pointermove", (e) => {
			if (e.pointerType !== "mouse") return;
			const b = el.getBoundingClientRect();
			const nx = (e.clientX - (b.left + b.width / 2)) / (b.width / 2);
			const ny = (e.clientY - (b.top + b.height / 2)) / (b.height / 2);
			tx = Math.max(-1, Math.min(1, nx)) * PULL_X;
			ty = Math.max(-1, Math.min(1, ny)) * PULL_Y;
			el.classList.add("is-magnet");
			if (!frame) frame = requestAnimationFrame(paint);
		});
		el.addEventListener("pointerleave", () => {
			tx = ty = 0;
			el.classList.remove("is-magnet");
			if (!frame) frame = requestAnimationFrame(paint);
		});
	});
}
