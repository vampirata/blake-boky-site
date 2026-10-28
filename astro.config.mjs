import { defineConfig } from "astro/config";

// SITE and BASE come from the deploy workflow; local dev serves from "/".
export default defineConfig({
	site: process.env.SITE ?? "http://localhost:4400",
	base: process.env.BASE ?? "/",
	trailingSlash: "ignore",
	build: { format: "directory" },
});
