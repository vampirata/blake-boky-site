# Collections CMS extraction notes

Source: live Framer site https://blakeandboky.com, rendered in Playwright at 1440x900, slow scrolled, network idle. Only visible elements at the 1440 breakpoint were read (rect width and height > 0, no `display:none` or `visibility:hidden` up the tree). Nav, footer and fixed chrome were excluded, except the fixed back link.

Scripts:

1. `node scripts/collections-render.mjs <rawDir>` renders the 38 sitemap URLs and dumps visible content to JSON (set `FRESH=1` to re-render).
2. `node scripts/extract-collections.mjs <rawDir>` parses the dumps, downloads originals, writes the JSON and validates.

Outputs: `src/content/data/collections.json` (7), `works.json` (30), `collections-index.json`. Assets: 217 originals (query string stripped, Framer hash filename kept), 71.1 MB, in `public/assets/collections/<slug>/`, `public/assets/collections/index/` and `public/assets/works/<slug>/`. Each URL is downloaded once: the first page that uses it owns the file (works were processed first), and all later records point at that path.

## Image records

Every image record has `src`, `alt`, `naturalWidth/Height` (read from the downloaded original with `sips`), `rendered` box at 1440, `objectFit`, `objectPosition`, `naturalAspect`, `renderedAspect`, `cropped` (cover and aspect off by more than 5%) and `cropPercentHidden`. `liveUrl` keeps the URL Framer actually served.

Cropping at 1440 (records, not unique files):

| Where | Records | Cropped | Worst hidden |
|---|---|---|---|
| Work gallery (lightbox grid) | 196 | 192 | 73.8% |
| Work ticker (marquee) | 159 | 0 (object-fit contain) | |
| Work prev/next thumbs (122x150) | 50 | 50 | 46.3% |
| Collection image grid | 23 | 22 | 68.2% |
| Collection work cards | 30 | 28 | 62.9% |
| Coming soon plate | 2 | 2 | 38.1% |
| Coming soon "in the meantime" cards | 24 | 24 | 76.8% |
| Index cards (350x350) | 12 | 11 | 58.8% |
| Index CTA background | 1 | 1 | 8.8% |

Total 330 of 531 records cropped, 212 of 217 unique files cropped somewhere. The client complaint is real: the work gallery uses fixed portrait cells (383x680 on Andromeda, 469x834 on Spirit and Fragments, 680x1209 or 448x796 on the indiv template) with `cover`, so landscape works lose most of the frame (e.g. Andromeda Adrasteo `iDg2kHWvlE5uDjskITYHX036gwU.jpg`, 4997x2328, 74% hidden). The ticker shows the same images uncropped with `contain`.

No CSS background images and no `<video>` elements exist on any Collections page at 1440.

## Templates and section order

### /collections (index)
Nav, Arrive (H4 "Collections"), Blog Posts grid (12 cards, 4 per row, 350x457: image 350x350, date, title), CTA (full bleed image 1440x638, H2 "Get in touch for further inquiries", "Contact Us" button to /contact), Footer.

### Collection page (andromeda, spirit-collection, in-lucem, fragments, figurative-poetry)
Fixed back link "← Collections", Head (eyebrow = artist line, H1 title), intro text (p, plus h4 pull quotes on Spirit), meta row YEAR / CATEGORY / SIZE / MEDIUM, image grid (two 710x620, then one 1440x480 or three 467x830), "THE WORKS" eyebrow + H2, work cards (4 per row, 433x913, image 433x770, date, title), Footer.
CMS fields: `slug, title, eyebrow, artist, intro[], meta{YEAR,CATEGORY,SIZE,MEDIUM}, gallery[], hero (first gallery image), worksEyebrow, worksHeading, works[], workCards[] {title,date,href,image}, seo`.

### Coming soon page (coming-soon-boky, coming-soon-blake)
Fixed back link, Hero (artist eyebrow, H1 "In Preparation", status "THIS COLLECTION IS COMING SOON"), Split (two paragraphs, CTAs "REGISTER INTEREST" to /contact and "BROWSE OTHER COLLECTIONS" to /collections | plate image 656x620), Elsewhere ("IN THE MEANTIME", "Collections you can see now", the same 12 collection cards, 344x755), Footer.

### Work page, template "work-zilo" (andromeda, spirit-collection, fragments)
Image Ticker (horizontal marquee, contain, 630 tall, images repeated for the loop), fixed back link, Title (H1), Name (H2, Andromeda and Spirit only), Content (rich text), Content 2 (rich text: credits, "Factsheet" H2, `Label : value` lines), Gallery Lightbox grid (3 per row), Prev/Next slots, Contact block ("GET IN TOUCH", "Inquire about this piece", line, "CONTACT US" to /contact). On Fragments, Content 2 sits after the gallery.

### Work page, template "work-indiv" (in-lucem, figurative-poetry)
Fixed back link, Title (H1, mostly upper case), Content, Gallery Lightbox (2 per row), Content 2, Content 3 (figurative-poetry only), Pagination (prev/next), Contact block, second in-flow back link at the bottom (figurative-poetry only). No ticker.

Work fields: `slug, collection, template, title, name, artist (from the collection eyebrow), fields{}, fieldOrder[], fieldsInferredFromProse[], description[] (Content html), details[] (Content 2 + 3 html), richText{content,content2,content3} (tag, html, text), images[] (gallery, display order), tickerImages[], prevNext{prev,next} {label,title,href,slug,thumb}, back[], contact, seo, sectionOrder`.
`fields` holds every `Label : value` line found (Dimensions, Weight, Year, Edition, Material). "Edition of ..." prose lines are also put into `Edition` and listed in `fieldsInferredFromProse`. HTML keeps inline links (e.g. "Bronze" links to sculpture-network.org).

## Odd things, recorded not fixed

Links
- /collections card "Andromeda Collection" links to `/collections/coming-soon-blake`, not `/collections/andromeda`. The Andromeda page is not linked from the index at all. The same wrong link appears in both coming soon "in the meantime" grids.
- "Rethink Collection" card links to `/collections/in-lucem` (a second card for In Lucem). "Spirit Collection : The Phantoms" and ": The Ushabtis" both link to `/collections/spirit-collection`. "The Figures : Marble", "The Figures : Early Work", "Public Installations" link to `coming-soon-blake`; "Silentium Aurum" links to `coming-soon-boky`. So there are 12 cards but 7 pages. `collections.json` is ordered by card position, matching Andromeda by title.
- In Lucem work pages: back link label reads "Spirit Collection" but goes to `../in-lucem`.
- Andromeda work pages: back link label reads "Andromedas".
- Footer "Wikipedia" link under [BOKY SOCIAL] has no href (outside scope, noted).

Head / SEO
- 20 work pages (Andromeda, Spirit, Fragments) have `<title>` "<Name> - Zilo — Framer Template by Sidebay Supply" and the generic site description.
- 10 indiv work pages have `<title>` "{{Title}} — In Lucem" / "{{Title}} — Figurative Poetry" (unresolved variable).
- No page in scope has an og:image.

Empty or missing content
- Meta SIZE empty on Andromeda, Spirit, Fragments; MEDIUM empty on Fragments. Figurative Poetry SIZE reads "18 534 m²"; In Lucem SIZE reads "7 artworks"; CATEGORY on Blake pages is "Blake Ward", on Boky pages "Boky Hackel".
- Andromeda collection has no intro text; Fragments intro is only "SCULPTURE FOR PEACE".
- broken-indiv: "Dimensions :" with no value; first gallery image shown twice. kaboom-indiv and loosing-myself-in-you-indiv also repeat a gallery image.
- traumtaub-indiv has no text at all (title and one image only). angel-angthal has no Content block and no factsheet.
- Empty rich text paragraphs on damaged-indiv, angel-dalquielle, angel-ecanus, angel-forces, angel-sariel.
- All work cards show date "Feb 24, 2026"; index cards show "May 12, 2025" or "May 17, 2026" (CMS publish dates, not artwork years).

Copy (verbatim in the JSON, typos kept)
- "Loosing Myself in YOU", "Das Ich Und Das Esch", "Artists Proofs" (hades-bl-755), "revel our presence", "acces", "ect;;;" and "Angel NUMBER 1" (Spirit intro h4).
- Titles with leading/trailing spaces: " Claymore M18A1", "Angel Bastet ", "Angel Hael ", "BROKEN ", "Restless Angels ", "CAN YOU FIX IT ? " etc.
- Some work copy is written in first person and includes a personal email (Blake@BlakeWard.com), "BTC and SOL Accepted" and "Please Contact me on my Profile Page" (Adrasteo, Forces, Valoel, Angthal and others), while the page CTA says "Contact us".

Could not read
- Nothing in scope failed to render or download. The lightbox overlay (opened on click) was not captured; it shows the same gallery images.
