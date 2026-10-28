import { defineConfig } from "astro/config";

// Fully static. SITE and BASE come from the deploy script; local dev serves from "/".
export default defineConfig({
	site: process.env.SITE ?? "http://localhost:4400",
	base: process.env.BASE ?? "/",
	trailingSlash: "ignore",
	build: { format: "directory" },
});
