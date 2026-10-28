// Typed-enough access to the CMS JSON in src/content/data. The JSON is the CMS:
// edit an entry and the pages, sitemap and links update on the next build.
import collectionsRaw from "../content/data/collections.json";
import worksRaw from "../content/data/works.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ImageRec = { src: string; alt?: string; naturalWidth?: number; naturalHeight?: number; role?: string; [k: string]: any };
export type Collection = { slug: string; title: string; artist?: string; comingSoon?: boolean; works: string[]; [k: string]: any };
export type Work = { slug: string; collection: string; title: string; images: ImageRec[]; [k: string]: any };

export const collections = collectionsRaw as unknown as Collection[];
export const works = worksRaw as unknown as Work[];

export const collectionBySlug = (s: string) => collections.find((c) => c.slug === s);
export const worksIn = (c: string) => {
	const col = collectionBySlug(c);
	const list = works.filter((w) => w.collection === c);
	if (!col?.works?.length) return list;
	return [...list].sort((a, b) => col.works.indexOf(a.slug) - col.works.indexOf(b.slug));
};

/** Strip Framer template leftovers from extracted SEO titles. */
export const cleanTitle = (t: string | undefined, fallback: string) => {
	if (!t || /\{\{|Framer Template|Sidebay/i.test(t)) return fallback;
	return t.replace(/\s*[|–—-]\s*Blake\s*&\s*Boky\s*$/i, "").trim() || fallback;
};
