# Fixes and open questions

Visuals match the live Framer site 1:1 at desktop (1400+), tablet (810 to 1399) and phone. These are the deliberate differences: bugs fixed, artwork no longer cropped, and items the client needs to answer. Lines starting "For the client" or marked "confirm" need a reply.

## Contact form

- Framer's form endpoint rejects posts from other hosts ("Invalid submission token"), so the form now uses Web3Forms when a key is set and otherwise opens the visitor's email app. See README.

## Home fixes

- Hero photo links: three photos had no link (null), one pointed to the malformed `https://collections/the-fragments-collection`, one linked to the home page itself. Now: kneeling torso to `/collections/fragments`; the other unlinked or self linked sculpture photos to `/collections`; the gold faces photo (Boky's gold leaf work) to `/boky-bio`. The two valid links (`/boky-bio`, `/blake-bio`) are kept.
- Hero photo links opened internal pages in a new tab (`target="_blank"`). They now open in the same tab like every other internal link.
- Hero photos were cropped by `object-fit: cover` (6 to 27%). Each frame now takes its image's own ratio, so nothing is cut.
- Hero on tablet and phone: live photos sat partly or fully off screen (x = -193 at 810, x = -637 at 390). Re-laid so all seven stay inside the viewport, no horizontal scroll. Parallax is off on touch devices and with reduced motion.
- Hero photos now have accessible link names (they were empty links).
- Stat counters never settled live (Sculptures made kept counting past 190, others stopped at random values). They now count up once when in view and settle on the endNumber set in the Framer Counter instances: 78+ exhibitions, 12 Collections, 350+ Sculptures made, 29 Countries exhibited in. The first live load showed 50+, 10, 90+, 29, so the client should confirm the stat figures.
- Reduced motion: no parallax, no count animation, final numbers shown. Without JS the final numbers are in the HTML.
- Stats grid images were cut 26 to 28% by cover. Now contained on the stone cell colour, whole sculpture visible.
- Boky portrait cut 25.5% of the head and chin area (centred cover in a square). Focal point set to 50% 15% so her head stays in frame.
- Fullscreen photo of Blake at work lost 59% / 68% of its width on tablet / phone with a centred crop. Focal point moved onto his face and hands (60% 45% tablet, 62% 45% phone).
- Article cards cut the sides of landscape press images (and the "Invoco Te Divina Stella" and "Sculptures Symbolizing Hope" headlines inside them) in a square frame. Now a 4:3 frame with contain on stone.
- Artist names were `h1` (three `h1`s on the page). They are now `h2`; the hero line stays the only `h1`.
- Sticky "Articles" layer: on phone the section is taller than the screen, so a plain `top: 0` would hide its lower cards behind the CTA band. It now sticks by its bottom edge when taller than the viewport.
- Page title: the CMS SEO title contains an em dash ("Blake Ward & Boky Hackel-Ward — Sculpture"); the page uses the site name "Blake & Boky" as its title and keeps the CMS description. Client may want a dash free SEO title.


- Blake bio, Collections: "Andromeda Collection" card linked to /collections/coming-soon-blake although the published page /collections/andromeda exists. It now links to /collections/andromeda.
- Blake bio, Collections: "Rethink Collection" card linked to /collections/in-lucem, which is Boky's collection. Rethink has no page of its own, so it now links to Blake's in-preparation page /collections/coming-soon-blake (same as "The Figures" cards).
- Blake bio, Collections: the cards cut landscape and square works by up to 77% (668x1188 cover frames, ratio 0.563). Frames are now 2:3 with the whole work contained on the page colour, aligned to the caption; on phone each work shows at its own ratio. The grid is shorter as a result.
- Boky bio, Collections and Past Works: square cover frames cut sculptures by 17 to 59%. Works are now contained in the square on the page colour (whole piece visible); on phone each work shows at its own ratio.
- Boky bio, hero portrait: the 380x380 centred crop cut the top of the head (25.5%). The square is kept, with the focal point moved to 50% 20% so the head and chin stay in frame.
- Boky bio, Artnet Feature: the square photo was cut to 656x520 (desktop), 341x520 (tablet) and 390x520 (phone). It is now shown whole in a 1:1 frame.
- Boky bio, Biography timeline: the 2011 entry "Begins working with Blake The Spirits Collection, embracing negative space..." was listed 5 times, all identical. Kept once.
- For the client (text kept as given, not changed): Boky timeline 1991 to 1996 ends mid-sentence: "...exploring photography, film and the art market. Working between". Please supply the end of the sentence.
- For the client (text kept as given): Boky timeline 1985 to 1987 "Boky moves to London" has no full stop and may be cut short. The extraction notes also flagged "...on the human experience which"; in the data that sentence continues ("which she has made her mission to share..."), so it is complete.
- For the client (kept as given): Boky bio "Exhibited In" countries and stats (4 major collections, 13 countries) are identical to Blake's, while home says 8 collections and 28 countries. Please confirm Boky's own figures.
- Note for the lead: the bio pages hide ContactCta's empty eyebrow and apply the CTA type role (52 / 42 / 32) to its heading via page scoped :global rules, to match the live bios. If ContactCta gains a no-eyebrow option and the CTA size, those rules can go.


- /collections: the "Andromeda Collection" card linked to /collections/coming-soon-blake; it now goes to /collections/andromeda (same fix in the "In the meantime" grids).
- /collections and coming soon grids: card images were cropped up to 59% (square at desktop, 9:16 at tablet and phone). Cards now use a 4:5 frame with the whole image contained on the page colour.
- Collection pages: work cards were 9:16 cover frames that cut wing tips and bases. They now use a 2:3 frame with the artwork contained on stone #5c5852 (hover zoom kept).
- Collection pages: feature images were cover cropped (up to 44%). Desktop and tablet keep the live row layout (2 up, then 3 up or full width) with every image contained on stone.
- Collection pages, phone: the row of 3 overflowed off screen (x = -50) and the row of 2 was hidden. All feature images now stack full width at their own ratio.
- Collection pages, tablet: the feature images were missing entirely on the live site; they are now shown in the desktop rows.
- Collection pages, desktop: the intro text, meta row, works heading and search touched the left edge of the window (0px gutter). They now sit on the 32px gutter used at tablet; images and the works grid stay full bleed.
- Collection pages: empty meta fields (for example SIZE on Spirit Collection and Andromeda) showed a label with no value. Empty fields are now left out.
- Spirit Collection intro: an unfinished placeholder ("... and continued into ect;;;") was cut back to "The collaborative process started in 2011 with Angel NUMBER 1." Ask the client for the rest of the sentence.
- Works search: ported from the WorksSearchGrid component, now listing works from works.json so every card links to a real work page, with a piece count and a "No pieces match your search." state. Without JavaScript the search bar is hidden and every card shows.
- Coming soon pages: "Collections you can see now" also listed collections that are themselves in preparation (Silentium Aurum, The Figures, Public Installations), linking back to coming soon pages. They are left out, leaving the 8 published collections.
- Coming soon pages: the plate image was cropped by up to 63% at tablet and phone. It is now contained (desktop frame kept) and shown at its own ratio on tablet and phone.
- Coming soon pages: page titles were "Coming Soon — Blake Ward"; now "Coming Soon: Blake Ward" (no dashes).
- Coming Soon Boky used the grey desktop nav on the live site while Coming Soon Blake used the light one; both now use the light nav on the paper background.

Flagged for the client:
- "Rethink Collection" card linked to Boky's /collections/in-lucem on live. Rethink is Blake's and has no page yet, so it now links to /collections/coming-soon-blake (same as the Blake bio). Client to confirm.

Polish pass:
- Each series now uses its live colour theme (Spirit stone; Andromeda and Fragments paper; In Lucem and Figurative Poetry dark), with matching nav, back pill, rules and cards.
- Coming Soon Boky is dark as on live; its title was unreadable live (#212121 on near-black) and now uses the lead colour.
- "Collections you can see now" no longer lists Rethink (no page yet), so it shows 7 cards.
- Lightbox: fades out on close, no scrollbar jump, tap on the margin closes, small originals are not blown up. Ticker only takes horizontal swipes.
- Search: count shows only while searching, Escape clears it.


- Page titles: the 20 Andromeda, Spirit and Fragments works were titled "<Name> - Zilo — Framer Template by Sidebay Supply"; the 10 In Lucem and Figurative Poetry works were titled "{{Title}} — In Lucem" or "{{Title}} — Figurative Poetry". Every work page is now titled with the work's own name.
- Descriptions: every work page used the generic site description. Each now uses the first paragraph of the work's own text (trimmed to about 155 characters), or the site default when the work has no text (Angel Angthal, TRAUMTAUB, BROKEN).
- Share image: no work page had an og:image. Each now uses its first gallery image.
- Back link labels: In Lucem works said "Spirit Collection" (but went to In Lucem); Andromeda works said "Andromedas". Both now show the real collection title ("In Lucem", "Andromeda") and link to it.
- Gallery tiles cut the artwork (9:16 frames with cover, up to 74% hidden on landscape works such as Andromeda Adrasteo). Tiles are now a 2:3 frame with the whole image contained on the page colour.
- Lightbox showed images cropped to a 9:16 frame. It now shows the whole image at full screen size.
- Lightbox additions: swipe between images on touch (and drag with a mouse), page scroll locked while open (smooth scroll paused too), keyboard focus kept inside the viewer and returned to the tile on close, image counter "n / N", neighbouring images preloaded, tap outside the image closes.
- Repeated gallery images removed: BROKEN, KABOOM! and Loosing Myself in YOU listed the same photo twice (in the grid, the lightbox and the ticker).
- Next/previous work thumbnails were cropped from the top (up to 46% hidden); they now show the whole piece.
- Ticker: with only one image (In Lucem works) the strip ran out and left an empty gap; it now repeats images until the strip always fills the screen. It also pauses when off screen or in a background tab, and shows a plain scrollable row when the visitor prefers reduced motion.
- Andromeda and Fragments works: the "Material" links (e.g. Bronze, Wax) were near white on the light page and almost invisible. They now use the dark text colour with an underline.
- Empty rich text paragraphs that held only "&nbsp;" (Damaged) no longer add blank gaps.


- News index, news article, past works index and past work detail: page titles are now the clean item title ("News", "Past Works", "<Article title>", "<Work title>") followed by the site name, instead of the Framer SEO strings.
- Past work detail: all 13 pages shared the same title and description ("Past Works, Boky Hackel-Ward" / "From the archive of Boky Hackel-Ward."). Each page now has its own title and a description built from its title, medium and year.
- News cards: square frames now contain the whole press image on the page colour (live cut 10 to 29% of the sides). The grid rhythm (350 / 385 / 360 squares) is unchanged.
- Past works cards: square frames now contain the whole work on #0f0f0f (live cut up to 44%, heads and bases of sculptures). Grid rhythm kept.
- Past work detail hero: shown whole at the image's own ratio, never taller than 80vh (live cut 55% of the square photos into a 1376x620 strip, faces included).
- Past work detail: the fixed back pill covered the "Boky Hackel-Ward" eyebrow on every width. The header now starts 26px lower so the eyebrow clears the pill.
- Past work detail, Chicago Interview and Press Document: no hero image is set in the CMS. The live page left an empty 620px placeholder; the rebuild drops the frame so there is no gap.
- Press Document: "View original" now opens the archived copy of the PDF on this site (`/assets/past-works/ccee0b_3e52acd46b8048f0b400f0050ed484e2.pdf`) in a new tab, instead of relying on the old bokysculpture.com file link.
- Past work detail, Ich und Es: the two inline portrait images were cut to 448x300 landscape strips. They now show whole, side by side.
- Past work detail: "View original" links open in a new tab (`target="_blank" rel="noopener"`).
- News article: the empty subheading in "Pietrasanta, understanding the poetry of space" (`<h3><br></h3>`) is rendered as a blank spacer line, not an empty heading.
- News article previous/next thumbs: shown whole (contained) when a photo's ratio differs by more than 12% from the 122x150 frame; near-matching photos keep the live cover crop.
- News index, news article and past works index: the Arrive title renders in Inter 300 26px as on the live site (the shared ArriveHeader defaults to the Cormorant H2 role), and the hairline under it is #363636 on the paper article page as live.

## For the client (kept verbatim, please confirm)

- Every news item is dated Nov 24, 2025 on the live site, so they all show the same date. Kept as is. Please send the real publication dates.
- Chicago Interview: the body still contains the editor note "Video pending upload, add the hosted link to the Video URL field once the file has been transcoded and uploaded." Kept as is, but it reads as an internal instruction on a public page. Please send the video link or approve removing the note.
- Spellings kept verbatim, please confirm: "Sculptures Symbolisiing Hope", "Fontveille" (Fontvieille), "Les Atlantes 1004", and the article slug "when-walls-become-words-buildings-as-silent-storytellers" for the Invoco Te Divina Stella interview (a template leftover in the URL; changing it would break existing links, so it stays).


- Galleries, Gallery Partners grid: square frames kept, but each gallery photo is now contained on paper instead of cropped (live cut 22 to 33% off the portrait photos, e.g. Petley Jones and Hilton Contemporary).
- Galleries, Installation Views: images show at their own ratio (live cropped them into fixed boxes, e.g. 432x258 for a 4:3 photo). Tablet keeps the live two-column arrangement (1 and 3 left, 2 right).
- Galleries, Exhibition banners: kept as cover crops (all three sources are landscape panoramas). A portrait source added later is shown whole instead of cropped into the strip.
- Gallery detail, image block: the live "Image Fill" cut a portrait sculpture into a wide strip (up to 71% lost). It now shows the whole image at its own ratio, max height 80vh, centred on paper.
- Gallery detail, "Visit gallery website": live linked each gallery page back to itself. It now links to the gallery's real external site from the data (Zurich Art Salon: maisondartgallery.com, Hilton Contemporary: hiltoncontemporary.com), opening in a new tab. The template label "Additional link" is no longer shown.
- Gallery detail, "Visit gallery website" hidden on Art Fairs and Salons and Petley Jones: the data has no external URL for them. Needs a URL from the client.
- Gallery detail, Petley Jones: placeholder body text "hhh" hidden (and the then empty info section with it). Needs real copy from the client.
- Gallery detail, empty `<p><br></p>` spacer paragraphs from the CMS dropped (Art Fairs and Salons started with one).
- Gallery detail, SEO title: live was the unfilled template "{{Title}} — Blake & Boky". Now uses the gallery title, e.g. "Petley Jones | Blake & Boky".
- Gallery detail, back pill: live used the dark pill at tablet and phone widths on a paper page. Now the light pill at every width.
- Galleries index, SEO title "Petley Jones Gallery — Blake & Boky" now goes through the shared title format ("Petley Jones Gallery | Blake & Boky").
- Contact, portrait: shown whole at its own ratio on phone (live cropped it to 3:2, cutting 16% off the height).
- Contact, form: posts with fetch to the Framer Forms endpoint (one constant, FORM_ENDPOINT, at the top of src/pages/contact.astro) with native validation, inline success and error states, and on failure an error that links to both artists' email addresses. One hidden honeypot field (website) replaces Framer's eleven.
- Contact, "Piece interested in" select: the 48 works are grouped under their collections (Fragments, Andromeda, Spirit Collection, In Lucem, Figurative Poetry) as optgroups, as in the Framer data.
- Galleries, Exhibitions banners: shown at their own ratio instead of fixed-height cover strips. The live crop cut up to 40% at wide screens, including people's heads and the baked-in "The Space Within" title.


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

## Bug hunt, 29 Oct 2026

Fixed:
- Menu was taller than the screen on a phone held sideways, so "Contact" was unreachable. It now fits and scrolls.
- Menu stayed open after tabbing past its last link. It now closes.
- Home counters used a screen reader label that is not allowed on that element.
- Image viewer did not close when clicking the dark area around the image.
- Image strip could jump by one pixel where the loop restarts; it can now also be used with the keyboard.
- News article "When walls become words": the "In Lucem Aurum" link led to a missing page (also broken on live).
- Chicago Interview showed an editor note ("Video pending upload ...") on the public page (also on live). Hidden.
- Duplicate page titles and descriptions across past works, news and galleries. Each page now has its own; every page has a share image.
- Content that fades in on scroll now shows immediately when reached with the keyboard.
- Addresses: served without a trailing slash, the same as the Framer site, with no extra redirect.

For the client (kept 1:1 with the live design):
- Some small text uses the original low contrast colours (light grey on the stone background, pale grey quotes, the gold "coming soon" eyebrow). Raising the contrast would help readability and accessibility; it is a design decision for the client.
- Links inside artwork text look the same as body text until hovered (live style).

## Image fitting, 29 Oct 2026

Kait's note: contained images left grids uneven. Grids now use the live site's exact frame shapes again (squares, 9:16 cards) and every image fills its frame without the artwork being cut:
- Each image is analysed for its studio backdrop and where the piece sits in it (`scripts/analyze-images.mjs`).
- If the frame only trims empty backdrop, the image fills the frame, positioned around the piece.
- If filling would touch the piece, the whole image shows and the rest of the frame continues the photo's own backdrop colours, feathered so there is no seam. Busy photos get a soft blurred copy of themselves behind instead.
- Logic: `src/lib/fit.ts`, used by `Img.astro` whenever a frame ratio is set.

## Colour modes, 29 Oct 2026

Rule (docs/rebuild-rules.md): Blake = paper, Boky = ink, both together = stone, gold accent everywhere.
- New tokens (appended to tokens.css): `--stone-text #dbdbdb`, `--stone-muted #c2c2c2`, `--stone-rule rgba(219,219,219,.25)`, `--stone-deep #4a4741`.
- Grey mode (stone, black nav, light text, soft light hairlines, dark back pill, dark Contact CTA, image fills on stone): Collections index, News index, Exhibitions & Galleries (Petley Jones) and its 4 gallery pages, Contact, 404.
- Paragraph copy on stone uses #dbdbdb (5.1:1), above the #c2c2c2 the Spirit work pages use (4.0:1); #c2c2c2 only for subtitles and placeholders.
- Petley Jones logo (black and red) sits on a small paper plate on stone so it stays legible.
- Contact: details cells are stone, deeper stone, black (gold eyebrow); form fields have light text and lines, gold focus line and outline, gold hover on Send; the open select list stays dark on paper.
- News articles by subject: Fragments of Infinity, Sculptures Symbolising Hope and Les Atlantes (Blake) paper; Invoco Te Divina Stella (interview with Boky) ink; Pietrasanta (their shared studio) stone. Unknown future articles default to stone. ArticleBody and PrevNext read `--n-*` colour variables from the page (paper by default).
- Verified already correct: home Stats and Articles on stone.
- Exhibitions & Galleries (index and the 4 gallery pages) went back to the white paper look after review: it reads better white (Kait, 29 Oct 2026).
- Contact went back to its original white look after review (Kait, 29 Oct 2026).
- Collections index, News (index and articles) and 404 went back to their original colours after review: Kait prefers the black (29 Oct 2026).
- Past Works index: the title touched the hairline above it (live pulled it up 10px). It now has 72 / 56 / 40px of room (desktop / tablet / phone).
- Bio pages, Collections: three smaller cards per row on desktop (about 387px wide, was two at 668px), two on tablet, one on phone (Kait, 29 Oct 2026).
- Home, gold hovers (Boky bar and the Read story buttons): text turns black on the gold (about 8:1 contrast; light text on gold was under 2:1). Gold unchanged.
