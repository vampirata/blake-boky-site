// Reads a bio page JSON (src/content/data/pages/<artist>-bio.json) into plain props
// for the bio components. Fixes applied here are listed in docs/fixes/bios.md.
import { collections } from "../../lib/data";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Section = { type: string; name: string; eyebrow?: string | null; heading?: { text: string } | null; body?: any[]; media?: any[]; links?: any[]; cards?: any[]; content?: any[] };
type Page = { seo: { title?: string; description?: string }; sections: Section[] };

const text = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const inner = (html: string) => html.replace(/^<p>/, "").replace(/<\/p>$/, "").trim();

export type TimelineEntry = { year: string; html: string };
export type CollectionCard = { href: string; title: string; years?: string; image?: { src: string; alt: string } };

/** Collection card links that pointed at the wrong page on the live site. */
const LINK_FIXES: Record<string, string> = {
	"Andromeda Collection": "/collections/andromeda",
	"Rethink Collection": "/collections/coming-soon-blake",
};
const published = new Set(collections.map((c) => `/collections/${c.slug}`));

export function readBio(page: Page) {
	const by = (type: string, name?: string) => page.sections.filter((s) => s.type === type && (!name || s.name === name));
	const hero = by("hero")[0];
	const quote = by("quote")[0];
	const bio = by("biography-timeline")[0];
	const [cols, pastWorks] = by("card-grid");
	const exh = by("exhibitions")[0];
	const cta = by("contact-cta")[0];
	const feature = by("feature")[0];

	// Biography: lead + paragraphs before the first Year, then Year/Detail pairs.
	const content = (bio.content ?? []).filter((c) => c.kind === "text");
	const lead = content.find((c) => c.role === "Lead");
	const paras = content.filter((c) => c.role === null).map((c) => text(c.text));
	const timeline: TimelineEntry[] = [];
	const dropped: TimelineEntry[] = [];
	for (let i = 0; i < content.length; i++) {
		if (content[i].role !== "Year") continue;
		const d = content[i + 1];
		const entry = { year: text(content[i].text), html: inner(d?.html ?? "") };
		const prev = timeline[timeline.length - 1];
		// The live site repeats the 2011 entry five times, identical. Keep one.
		if (prev && prev.year === entry.year && prev.html === entry.html) dropped.push(entry);
		else timeline.push(entry);
	}

	const collectionCards: CollectionCard[] = (cols.cards ?? []).map((c) => {
		const title = text(c.texts?.[0]?.text);
		const years = c.texts?.[1] ? text(c.texts[1].text) : undefined;
		let href: string = LINK_FIXES[title] ?? c.href;
		if (!published.has(href)) href = "/collections";
		return { href, title, years, image: c.image ? { src: c.image.src, alt: text(c.image.alt) || title } : undefined };
	});

	const body = exh.body ?? [];
	const countries = body.filter((b) => b.role === "Country").map((b) => text(b.text));
	const nums = body.filter((b) => b.role === "Number").map((b) => text(b.text));
	const labels = body.filter((b) => b.role === "Label").map((b) => text(b.text));
	const stats = nums.map((n, i) => ({ value: n, label: labels[i] ?? "" }));

	return {
		seo: page.seo,
		hero: {
			eyebrow: text(hero.eyebrow),
			name: text(hero.heading?.text),
			tagline: text(hero.body?.[0]?.text),
			portrait: { src: hero.media?.[0]?.src as string, alt: text(hero.media?.[0]?.alt) },
		},
		quote: text(quote.body?.[0]?.text),
		bio: { eyebrow: text(bio.eyebrow), heading: text(bio.heading?.text), lead: text(lead?.text), paras, timeline, dropped },
		collections: { eyebrow: text(cols.eyebrow), heading: text(cols.heading?.text), cards: collectionCards },
		exhibitions: { eyebrow: text(exh.eyebrow), heading: text(exh.heading?.text), countries, stats },
		cta: { heading: text(cta.heading?.text) },
		feature: feature && {
			eyebrow: text(feature.eyebrow),
			title: text(feature.heading?.text),
			quote: text(feature.body?.[0]?.text),
			cite: text(feature.body?.[1]?.text),
			image: { src: feature.media?.[0]?.src as string, alt: text(feature.media?.[0]?.alt) },
			link: { label: "Read the article", href: feature.links?.[0]?.href as string },
		},
		pastWorks: pastWorks && { eyebrow: text(pastWorks.eyebrow), heading: text(pastWorks.heading?.text) },
	};
}
