import type { APIRoute } from "astro";

// Preview deploys stay out of search engines; only the real domain is indexable.
export const GET: APIRoute = ({ site }) => {
	const live = site?.hostname === "blakeandboky.com";
	const body = live
		? `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", site)}\n`
		: "User-agent: *\nDisallow: /\n";
	return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
