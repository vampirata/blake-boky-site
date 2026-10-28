// Site-wide behaviour: smooth scroll, scroll reveals, per-character titles, mobile menu.
import Lenis from "lenis";

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) root.classList.add("reduce");

// Smooth scroll only on the pages that had it live (data-smooth on <html>).
let lenis: Lenis | null = null;
if (!reduce && root.dataset.smooth === "true") {
	lenis = new Lenis({ lerp: 0.1 });
	const raf = (t: number) => {
		lenis?.raf(t);
		requestAnimationFrame(raf);
	};
	requestAnimationFrame(raf);
}
(window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;

// Reveal on scroll. Staggers siblings that enter together.
const io = new IntersectionObserver(
	(entries) => {
		let n = 0;
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			const el = e.target as HTMLElement;
			if (el.hasAttribute("data-reveal") && !el.style.getPropertyValue("--d")) {
				el.style.setProperty("--d", `${Math.min(n++, 6) * 80}ms`);
			}
			el.classList.add("is-in");
			io.unobserve(el);
		}
	},
	{ rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
);
document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => io.observe(el));

// Safety net: never leave content hidden (e.g. headless capture, print).
addEventListener("beforeprint", () => document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => el.classList.add("is-in")));

// Mobile and tablet menu box.
const box = document.querySelector<HTMLElement>("[data-menu]");
const toggle = box?.querySelector<HTMLButtonElement>("[data-menu-toggle]");
if (box && toggle) {
	const set = (open: boolean) => {
		if (open) box.style.setProperty("--open-h", `${box.scrollHeight}px`);
		box.classList.toggle("is-open", open);
		toggle.setAttribute("aria-expanded", String(open));
	};
	toggle.addEventListener("click", () => set(!box.classList.contains("is-open")));
	addEventListener("keydown", (e) => {
		if (e.key === "Escape" && box.classList.contains("is-open")) {
			set(false);
			toggle.focus();
		}
	});
	document.addEventListener("click", (e) => {
		if (box.classList.contains("is-open") && !box.contains(e.target as Node)) set(false);
	});
}
