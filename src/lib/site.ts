// Global chrome content, read from the live site (nav, footer, socials).
export const nav = [
	{ label: "Blake", menu: "Blake Biography", href: "/blake-bio" },
	{ label: "Boky", menu: "Boky Biography", href: "/boky-bio" },
	{ label: "Past Works", menu: "Past Works", href: "/past-works" },
	{ label: "Collections", menu: "Collections", href: "/collections" },
	{ label: "Exhibitions & Galleries", menu: "Exhibitions & Galleries", href: "/galleriespetley" },
	{ label: "News", menu: "News", href: "/news" },
	{ label: "Contact", menu: "Contact", href: "/contact" },
];

export const footer = {
	links: [
		{ label: "Blake Biography", href: "/blake-bio" },
		{ label: "Boky Biography", href: "/boky-bio" },
		{ label: "Past Works", href: "/past-works" },
		{ label: "Collections", href: "/collections" },
		{ label: "Exhibitions & Galleries", href: "/galleriespetley" },
		{ label: "News", href: "/news" },
	],
	blake: [
		{ label: "Instagram", href: "https://www.instagram.com/blakesculpture/" },
		{ label: "Sculpture Network", href: "https://sculpture-network.org/en/artist/669/blake-ward" },
		{ label: "Wikipedia", href: "https://en.wikipedia.org/wiki/Blake_Ward" },
	],
	boky: [
		{ label: "Instagram", href: "https://www.instagram.com/boky_sculpture/" },
		{ label: "Sculpture Network", href: "https://sculpture-network.org/en/artist/44147/boky-hackel-ward" },
	],
};

export const SITE_NAME = "Blake & Boky";
export const DEFAULT_DESCRIPTION =
	"Figurative sculpture by Blake Ward and Boky Hackel-Ward, working between Monaco and Pietrasanta.";

/** Prefix an internal path with the deploy base. */
export const url = (p: string) => {
	if (/^(https?:|mailto:|tel:|#)/.test(p)) return p;
	const base = import.meta.env.BASE_URL.replace(/\/$/, "");
	return base + (p.startsWith("/") ? p : "/" + p);
};
