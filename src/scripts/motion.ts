// Site-wide behaviour: smooth scroll, scroll reveals, image wipes, per-character
// titles, page transitions, cursor, magnetic buttons, mobile menu.
// One motion feel throughout: calm, decelerating, no overshoot (tokens.css).
import Lenis from "lenis";
import { initCursor } from "./cursor";
import { initMagnetic } from "./magnetic";

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) root.classList.add("reduce");

// Smooth scroll on every page. Wheel only (touch keeps native momentum), in-page
// anchors handled, keyboard and scroll restoration stay native because Lenis
// drives the real window scroll. Off with reduced motion.
let lenis: Lenis | null = null;
if (!reduce) {
	lenis = new Lenis({ lerp: 0.09, anchors: { offset: -80 }, autoRaf: true });
}
(window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;

// Image wipes. Imagery below the fold rises in behind a clip-path curtain and
// settles from a slight scale. Above-the-fold images (LCP) are never hidden.
const WIPE_SKIP = "[data-ticker], [data-no-wipe], .cta, [data-parallax]";
const wipes = new Set<Element>();
if (!reduce) {
	const vh = innerHeight;
	document.querySelectorAll<HTMLElement>("main .art").forEach((art) => {
		if (art.closest(WIPE_SKIP)) return;
		const b = art.getBoundingClientRect();
		if (b.width === 0 || (b.top < vh && b.bottom > 0)) return;
		// A wrapper whose only job was fading this image in: the wipe replaces that fade.
		const wrap = art.parentElement?.closest<HTMLElement>("[data-reveal]");
		if (wrap && !wrap.textContent?.trim() && wrap.querySelectorAll(".art").length === 1) {
			wrap.removeAttribute("data-reveal");
		}
		art.classList.add("is-pending");
		wipes.add(art);
	});
}

// Reveal on scroll. Staggers siblings that enter together.
const io = new IntersectionObserver(
	(entries) => {
		let n = 0;
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			const el = e.target as HTMLElement;
			if (wipes.has(el)) {
				el.style.setProperty("--d", `${Math.min(n++, 6) * 90}ms`);
				el.classList.add("is-wiping");
				el.classList.remove("is-pending");
				setTimeout(() => el.classList.remove("is-wiping"), 2000);
			} else {
				if (el.hasAttribute("data-reveal") && !el.style.getPropertyValue("--d")) {
					el.style.setProperty("--d", `${Math.min(n++, 6) * 80}ms`);
				}
				el.classList.add("is-in");
			}
			io.unobserve(el);
		}
	},
	{ rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
);
document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => io.observe(el));
wipes.forEach((el) => io.observe(el));

// Safety net: never leave content hidden (print).
addEventListener("beforeprint", () => {
	document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => el.classList.add("is-in"));
	wipes.forEach((el) => el.classList.remove("is-pending"));
});

// Shared-element page transition, old-page side. The image of the card that was
// clicked (or, going back, the artwork we arrived through) is named so the
// browser morphs it into the same artwork on the next page. Base.astro holds the
// new-page side. Browsers without cross-document view transitions just navigate.
type W = Window & { __bbArrived?: string };
let clickedArt: HTMLElement | null = null;
document.addEventListener(
	"click",
	(e) => {
		const a = (e.target as Element).closest?.("a[href]");
		clickedArt = a?.querySelector<HTMLElement>(".art[data-src]") ?? null;
	},
	true
);
const inView = (el: Element) => {
	const b = el.getBoundingClientRect();
	return b.width > 0 && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth;
};
addEventListener("pageswap", (e: Event) => {
	const vt = (e as Event & { viewTransition?: ViewTransition | null }).viewTransition;
	const picked = clickedArt;
	clickedArt = null;
	if (!vt || reduce) return;
	let el = picked && inView(picked) ? picked : null;
	const back = (window as W).__bbArrived;
	if (!el && back) {
		el = [...document.querySelectorAll<HTMLElement>("main .art[data-src]")].find((a) => a.dataset.src === back && inView(a)) ?? null;
	}
	if (!el) return;
	const target = el;
	target.style.viewTransitionName = "bb-art";
	try {
		sessionStorage.setItem("bb-vt", target.dataset.src ?? "");
	} catch {}
	vt.finished.finally(() => (target.style.viewTransitionName = ""));
});

// Desktop pointer niceties.
if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
	initCursor();
	initMagnetic();
}

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
	// Keyboard: tabbing out of the open menu closes it, so it never covers the focused element.
	box.addEventListener("focusout", (e) => {
		const next = e.relatedTarget as Node | null;
		if (next && !box.contains(next) && box.classList.contains("is-open")) set(false);
	});
}
