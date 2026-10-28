import type { APIRoute } from "astro";

// Every built page, from Astro's own route list, so new CMS entries are included automatically.
const pages = import.meta.glob("./**/*.astro", { eager: true }) as Record<string, { getStaticPaths?: () => Promise<{ params: Record<string, string> }[]> }>;

export const GET: APIRoute = async ({ site }) => {
	const paths: string[] = [];
	for (const [file, mod] of Object.entries(pages)) {
		if (file.includes("404")) continue;
		let route = file.replace(/^\.\//, "/").replace(/\.astro$/, "").replace(/\/index$/, "") || "/";
		if (route.includes("[")) {
			if (!mod.getStaticPaths) continue;
			for (const p of await mod.getStaticPaths()) {
				let r = route;
				for (const [k, v] of Object.entries(p.params)) r = r.replace(`[${k}]`, v);
				paths.push(r);
			}
		} else paths.push(route);
	}
	const base = (site?.href ?? "").replace(/\/$/, "");
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)]
		.sort()
		.map((p) => `  <url><loc>${base}${p === "/" ? "/" : p}</loc></url>`)
		.join("\n")}\n</urlset>\n`;
	return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
