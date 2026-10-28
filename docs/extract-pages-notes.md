# Page extraction notes (non-collections)

Source: https://blakeandboky.com, rendered in Chromium (Playwright 1.56.1) at 1440x900, scrolled to the bottom in 400px steps, network idle. Only elements that are not `display:none` / `visibility:hidden` were read, so the data is the 1440 breakpoint only. Extracted 28 Oct 2026.

## How to re-run

```
node scripts/extract-pages.mjs      # renders 29 URLs + 390px mobile menu, writes scripts/.raw/*.json (~2 min)
node scripts/build-content.mjs      # writes src/content/data/**, downloads assets + fonts, validates
node scripts/view-raw.mjs scripts/.raw/home.json   # human-readable dump of one raw page
```

`scripts/.raw/__findings.json` holds the machine list of broken links, empty fields, placeholders and every cropped image.

## Output

| File | Contents |
|---|---|
| `src/content/data/site.json` | logo (live text), favicon, nav (desktop + mobile labels/order, nav variant per page), footer, fonts, page backgrounds |
| `src/content/data/pages/{home,blake-bio,boky-bio,contact,news,past-works,galleriespetley}.json` | `seo`, `navVariant`, ordered `sections[]`: `type`, `name` (Framer layer name), `eyebrow`, `heading`, `body[]`, `media[]`, `links[]`, `cards[]` (link-wrapped groups), `stats[]` (home), `form` (contact), and `content[]` (every visible item in DOM order with font family/size/weight) |
| `src/content/data/past-works.json` | 13 items, index order |
| `src/content/data/news.json` | 5 items, index order |
| `src/content/data/galleries.json` | 4 items, index order |
| `public/assets/{home,bio,contact,news,past-works,galleries,global}/` | 65 files, 64.4 MB, originals (query strings stripped), Framer hash filenames. An image used in several places is stored once, in the area that registered it first (CMS detail areas win) |
| `public/fonts/{inter,cormorant-garamond,switzer}/` | 56 font files, 1.6 MB |

Every image record has `src`, `alt`, `naturalWidth`, `naturalHeight` (of the downloaded original), `rendered {w,h}` at 1440, `objectFit`, `objectPosition`, `cropped`, and `cropRatio` (rendered aspect / natural aspect) when cropped.

## Section order per template

- **Home**: hero-collage (H1 + 7 floating images, 3 linked) · artists-intro (Blake / Boky columns: eyebrow, H1 name, tagline, portrait, blurb, "HIS/HER COLLECTIONS", CTA) · stats (4 counters + 4 image tiles) · "All Collections" link bar · full-bleed image (sticky/parallax, 1440x1080 in a 900 tall frame) · news teaser (All Articles + 4 cards) · contact CTA banner (background image) · footer.
- **Blake bio / Boky bio**: hero · artist statement (quote) · biography (3 or 4 paragraphs + year/description timeline) · collections cards · "Exhibited In" (country list + 4 stats) · contact CTA. Boky adds: Artnet feature (quote, critic, "Read the article →", image) · "Past Works" grid (13 cards). Note the Boky page puts these two sections *after* the contact CTA.
- **Contact**: hero (eyebrow, H1, line) · portrait image · details grid (Atelier / Blake / Boky) · message form.
- **News index**: page title "News" · 5 cards (image, date, title) · contact CTA banner.
- **News detail**: page title (H4 in the top bar) · hero image (659 wide, height varies) · article (date + rich text body) · previous/next (thumb + title) · "← News" back link.
- **Past Works index**: top bar "Boky Hackel-Ward" · "← Back to Boky" · heading + intro · 13 cards (3 columns, image + title) · contact CTA banner.
- **Past Works detail**: artist eyebrow · title · YEAR / MEDIUM meta · hero image 1376x620 · body paragraphs (+ optional 2-up gallery) · source line · "View original →" · "← Past Works".
- **Galleries index (/galleriespetley)**: hero (Petley Jones Gallery + logo) · "Gallery Partners" 4 cards (image, date, title) · introduction · 3 exhibitions (image, year, title, text) · installation views (3 images) · visit (by appointment) · contact CTA.
- **Galleries detail**: hero (eyebrow + H1) · image 1312x560 · info (rich text + "Visit gallery website" / "Additional link") · contact CTA · "← Galleries".

## CMS fields

- **Past works**: `slug, path, order, title, cardTitle, cardImage, artist, meta[{label,value}], year, medium, heroImage, body[] (p html or image, in order), sourceLabel, externalLink{label,href,local?}, backLink, seo{title,description,ogTitle,ogDescription,ogImage,canonical}`
- **News**: `slug, path, order, title, cardTitle, date, cardDate, author (null), category (null), cardImage, heroImage, body[] (blocks: tag h2/h3/p/blockquote/ul with html, empty flag; inline images if any), previous{title,href,thumb}, next{…}, backLink, seo`
- **Galleries**: `slug, path, order, title, eyebrow, cardTitle, date, cardImage, heroImage, content[] (html), externalLinks[{slot,label,href}], cta{heading,link}, backLink, seo`

## Global

- **Nav, desktop**: text logo "Blake & Boky" (Cormorant Garamond 22/600) + Blake · Boky · Past Works · Collections · Exhibitions & Galleries · News · Contact. Three colour variants by page: `Desktop BLACK` (home), `Desktop Light`, `DESKTOP GREY` (map in `site.nav.variantsByPage`).
- **Nav, mobile (390)**: a 200px pill at top left showing only the logo; tapping it expands the panel downward: Home · Blake Biography · Boky Biography · Past Works · Collections · Exhibitions & Galleries · News · Contact, with a close "×". The labels differ from desktop. Screenshot: `scripts/.raw/mobile-menu-open.png`.
- **Footer**: same on every page. Columns `[LINKS]` (6, no Contact), `[BLAKE SOCIAL]`, `[BOKY SOCIAL]`, large "Blake & Boky", "Contact" link with arrow, "Copyright © 2026 Blake&Boky. All rights reserved." (leading space and missing spaces around "&" are on the site).
- **Fonts**: Cormorant Garamond (300 to 700, normal/italic; in use 300/400/500/600), Inter (300/400/700 + italics, 7 unicode subsets each; in use 300/400), Switzer (300 normal, 400 italic; in use 300/400). Fragment Mono is declared but never used, so it was not downloaded. All files come from fonts.gstatic.com / framerusercontent.com.
- **Favicon**: one JPG for light and dark (`/assets/global/VNUMh0oHReAipsJOyJ7cr8897k.jpg`). **No OG or Twitter image on any page.**
- **Contact form**: POST to Framer Forms `https://api.framer.com/forms/v1/forms/3eb57677-3c73-4469-885a-804fb17280c9/submit` (taken from the JS bundle, not the DOM; not submitted). Fields: `name` (text, "Your name", required), `email` (email, "you@example.com", required), `piece_interested_in` (select, optional, 49 options incl. "General inquiry — no specific piece", in 5 divider groups: Fragments, Andromeda, Spirit Collection, In Lucem, Figurative Poetry), `message` (textarea, "How can we help?", required). Submit "SEND MESSAGE". 11 hidden honeypot inputs (website, company, message, subject, …). Note under the form: "We aim to reply within a few days. …"

## Cropping (client says images are cut off)

102 image placements across 53 distinct files are cover-cropped by more than 5%. Worst cases: bio collection cards (668x1188 portrait slots filled with landscape photos, ratio 0.37 to 0.56), past-works and galleries detail heroes (portrait photos in 1376x620 / 1312x560 landscape frames, ratio 3.2 to 3.5), the contact CTA banner backgrounds, and every square card thumbnail. The full list is in `scripts/.raw/__findings.json` → `croppedList`.

## Broken links, empty fields, placeholders

- Home hero collage: 3 of 7 images have a link component with no href; one links to `https://collections/the-fragments-collection` (malformed, host is a slug); one links to `/` (the page itself). Linked ones open in `_blank`.
- Footer `[BOKY SOCIAL]` → Wikipedia has no href.
- All 4 gallery details: "Visit gallery website" points to the page itself (empty link field). Only Zurich Art Salon and Hilton Contemporary have a working "Additional link".
- Blake bio collections: "Andromeda Collection", "The Figures : Marble" and "The Figures : Early Work" go to `/collections/coming-soon-blake` although `/collections/andromeda` exists; "Rethink Collection" goes to `/collections/in-lucem` (Boky's collection).
- Past works: Chicago Interview and Press Document have no hero image (Framer striped placeholder) though their index cards have images; Chicago Interview body says "Video pending upload — add the hosted link to the “Video URL” field…" and has no external link; At Mark Massa's and Charting Landscapes have no "bokysculpture.com" source line. Press Document PDF (9.9 MB) downloaded to `/assets/past-works/ccee0b_3e52acd46b8048f0b400f0050ed484e2.pdf`. Several items share an image (Kaboom! = At Mark Massa's; The Restless Gaze = The Story; Chicago Interview = Press Document card).
- Galleries: SEO title is the unfilled template `{{Title}} — Blake & Boky` on all 4 details. Petley Jones body is "hhh". Hilton Contemporary body sentence ends mid-thought ("…hosted their first joint exhibition"). Art Fairs content starts with an empty paragraph. Zurich Art Salon (dated Aug 6, 2026) lists opening hours for Oct 2025. All carry the eyebrow "GALLERY PARTNER", even the fairs.
- News: every article is dated "Nov 24, 2025" (probably the CMS default). No author or category anywhere. Several bodies contain empty paragraphs (kept, flagged `empty: true`). Slugs do not match titles (`when-walls-become-words…` is the Boky interview, `the-weight-of-empty-space…` is the Pietrasanta piece). The first item has no "Previous", the last no "Next".
- Boky bio timeline: the 2011 entry "Begins working with Blake The Spirits Collection…" appears **5 times** (all visible). Two sentences are cut off: "…on the human experience which" and "Working between". The Boky bio "Exhibited In" countries and stats are identical to Blake's (4 major collections, 13 countries), while home says 8 collections and 28 countries.
- Past Works index and detail SEO titles say "— Boky Hackel-Ward"; other pages say "— Blake & Boky".

## Client typos (recorded, not fixed)

- "Sculptures Symbolisiing Hope" (news title + slug)
- "Fontveille : Blake et "Les Atlantes" 1004" (title; the body says "Fontvieille"; "1004" is probably 2004)
- Home Boky blurb: "her youth lit by the Venezuelan Sun and and Boky works…" (doubled "and", sentence runs on)
- Interview: "where does you inspiration come from ?"
- Boky bio: "jungle were nature", "Her. mother", "human kind", "Antique's Trade", "l'Instituto", "An Homage"; hero name "Boky Hackel" vs "Boky Hackel-Ward" elsewhere
- Blake bio: "Blake William Ward born in…" (no verb); "The Fragments Collection the artist deliberately…"
- Select options: "Loosing Myself in YOU", "Das Ich Und Das Esch" (past work is "Ich und Es"), "CAN YOU FIX IT ?"
- Home stats labels are lowercase/trailing-space as on site: "exhibitions ", "Sculptures made ", "Countries exhibited in "
- Spaces before "?" and ":" throughout (French-style), kept verbatim.

## Odd or unreadable

- The home stats numbers are plain spans (likely animated counters); the values are the final ones after scrolling.
- The home full-bleed image and the news teaser use sticky/parallax positioning, so their `box.y` values are approximate. Section order is DOM order and matches the visual order.
- Text in `content[]` is verbatim, including trailing spaces and `\n` from Framer line breaks.
- No YouTube/Vimeo iframes or `<video>` elements on any in-scope page.
