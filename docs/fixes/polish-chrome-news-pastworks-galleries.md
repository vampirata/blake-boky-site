# Fixes: polish pass (global chrome, news, past works, galleries)

- Mobile and tablet menu: the open box now matches live (469px, first row turns into "Home", 8 rows, text 10px in, 24px Cormorant 500 with -0.04em tracking, hairline #363636 border, #dbdbdb plus icon). The open and close spring now follows the live curve (about 50% at 200ms, 87% at 400ms, settled at 1s).
- Mobile menu: Escape now closes the open menu (live ignores Escape).
- Desktop nav on light pages: links #000 and wordmark #212121 with a gold (#cca46c) hover, as live.
- Back pill: sits at top 88px at every width (was 76px below 1400), the border is drawn inside the box so it is 38px tall like live, and on hover the fill turns gold (dark pill) or light gold (light pill) while the border fades out and the text keeps its colours.
- Past works index and past work detail: live shows the light back pill (dark text) on the dark page at tablet and phone, so "Back to Boky" and "Past Works" are nearly invisible. The rebuild keeps the dark pill at every width.
- Footer: rebuilt to the live geometry at all three widths (three 216px columns with 12px text inset, links 41.6px apart, gold light top rule above the copyright, Contact with the live arrow icon). Below 1400 the order is columns, Contact, then the wordmark fitted to the width and centred, as live.
- Footer: the live [BOKY SOCIAL] column has a "Wikipedia" link with no address (it does nothing). It is left out until the client sends Boky's Wikipedia page.
- Pre-footer CTA band: heading uses the live H2 role (54/44/34px, +0.5px tracking, single line on desktop) and the Contact Us button is 54px tall with the live arrow icon and 24/21/18px label.
- News index: card captions match live (10px under the frame, 12px inset, titles wrap at 326px, centred caption block below 1400). The bottom line now behaves as live (slides in on hover on desktop, always shown below 1400) instead of a rule under the image.
- News article: section heading, quote and list spacing match live; the hero sits 20px under the header rule at every width; Previous/Next cards are 470x150 with the live inside border and spacing (side by side, touching, below 1400; stacked 9px apart on phone).
- News article at tablet: live leaves an empty gap of about 430px between the article and Previous/Next. The rebuild keeps the same 125px gap as desktop and phone.
- News article hero at tablet: shown whole at its own ratio (live cropped the magazine cover and cut off its printed title).
- Past work detail: Year and Medium each get their own top rule like live, and the description, source line and View original button use the live spacing and widths.
- Galleries index: the partner logo multiplies onto the paper like live (no white box); every section carries the live 1px #d8d2c6 top rule; partner card lines slide in on hover on desktop; exhibition titles wrap at 284px on tablet like live.
- Gallery detail: 1px #d8d2c6 rule on top of the info and Contact CTA sections like live; "Opening Hours:" in the body colour; spacer paragraphs between paragraphs are kept (live spacing) and only leading or trailing empty ones are dropped.
