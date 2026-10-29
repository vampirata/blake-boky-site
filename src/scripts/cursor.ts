// Desktop pointer only (motion.ts checks hover + fine pointer + motion allowed).
// A small gold dot rides with the native cursor, 1:1 with no lag. Over artwork
// links it grows into "View", over the image ticker into "Drag"; only then is the
// native cursor hidden. Over other links and buttons it steps aside, and over
// text fields it disappears so the I-beam is untouched.

const TEXT = "input, textarea, select, [contenteditable], [contenteditable] *";
const label = (t: Element | null): string | null => {
	if (!t) return null;
	const own = t.closest<HTMLElement>("[data-cursor]");
	if (own) return own.dataset.cursor || null;
	if (t.closest("[data-ticker] .tk-view")) return "Drag";
	const link = t.closest("a[href], button");
	if (link && link.querySelector(".art")) return "View";
	return null;
};

export function initCursor() {
	const root = document.documentElement;
	const c = document.createElement("div");
	c.className = "cursor";
	c.setAttribute("aria-hidden", "true");
	c.innerHTML = '<span class="cursor-disc"><span class="cursor-label"></span></span>';
	document.body.append(c);
	const text = c.querySelector<HTMLElement>(".cursor-label")!;
	root.classList.add("has-cursor");

	let x = -100;
	let y = -100;
	let frame = 0;
	let state = "";
	const apply = (target: Element | null) => {
		let next = "dot";
		let word: string | null = null;
		if (!target || target.closest(TEXT)) next = "off";
		else if ((word = label(target))) next = "label";
		else if (target.closest("a[href], button, [role=button], label, summary")) next = "link";
		if (word) text.textContent = word;
		if (next !== state) {
			state = next;
			c.dataset.state = next;
			root.classList.toggle("cursor-hide", next === "label");
		}
	};
	const paint = () => {
		frame = 0;
		c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
	};
	addEventListener(
		"pointermove",
		(e) => {
			if (e.pointerType !== "mouse") {
				c.dataset.state = state = "off";
				return;
			}
			x = e.clientX;
			y = e.clientY;
			c.classList.add("is-live");
			apply(e.target as Element);
			if (!frame) frame = requestAnimationFrame(paint);
		},
		{ passive: true }
	);
	// Content scrolls under a still pointer: re-check what is under it.
	let scrollFrame = 0;
	addEventListener(
		"scroll",
		() => {
			if (scrollFrame || state === "off") return;
			scrollFrame = requestAnimationFrame(() => {
				scrollFrame = 0;
				apply(document.elementFromPoint(x, y));
			});
		},
		{ passive: true }
	);
	document.documentElement.addEventListener("pointerleave", () => c.classList.remove("is-live"));
	addEventListener("pointerdown", () => c.classList.add("is-down"));
	addEventListener("pointerup", () => c.classList.remove("is-down"));
	addEventListener("blur", () => c.classList.remove("is-live", "is-down"));
}
