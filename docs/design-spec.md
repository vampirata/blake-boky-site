# Blake & Boky: design spec (measured from the live Framer site)

Measured 28 Oct 2026 from https://blakeandboky.com with Playwright/Chromium at 1440x900, 810x1100 and 390x844, after wheel-scrolling each page to the bottom so lazy content and scroll appears settled.

Raw data (read these when a number below is not enough):

- `docs/reference/screens/<template>-<width>.png`: full-page screenshots, plus `menu-open-390.png`
- `docs/reference/text/<template>-<width>.json`: every visible text node (text, x, y, width, font, size, weight, line height, tracking, colour, transform)
- `docs/reference/layout/<template>-<width>.json`: sections, grids, rails, images (natural vs rendered, fit, position, cut), tallies, nav, motion
- `docs/reference/layout/_interactions.json`: hover diffs, nav scroll states, page transition, detail-page probes
- `docs/reference/summary.txt`: type scale per width, colour/radius tallies, and a per-template digest
- `docs/reference/crop-audit.json`: every cropped image
- Scripts: `scripts/measure-*.mjs`. Rerun with `node scripts/measure-all.mjs [template] [width]`, then `node scripts/measure-analyze.mjs` and `node scripts/measure-crop.mjs`.

Template keys map to these URLs: home `/`, collections `/collections`, collection-detail `/collections/spirit-collection`, artwork-detail `/collections/spirit-collection/angel-forces`, collection-coming-soon `/collections/coming-soon-blake`, past-works `/past-works`, past-work-detail `/past-works/the-story`, news `/news`, news-article `/news/sculptures_symbolisiing_hope`, galleries `/galleriespetley`, gallery-detail `/galleriespetley/petley-jones`, blake-bio, boky-bio, contact.

---

## 1. Tokens

### Breakpoints (from the page CSS media queries)

| Name | Range | Measured at |
|---|---|---|
| Desktop | min-width 1400px | 1440 |
| Tablet | 810px to 1399.98px | 810 |
| Phone | max-width 809.98px | 390 |

Some components also use an extra split, `(min-width: 810px) and (max-width: 1199px)`. Tablet and phone share one nav: the floating black menu box. The desktop bar only appears at 1400px and above, so a 1280px laptop gets the tablet layout. This is Framer's behaviour, and the rebuild should copy it.

### Colour palette (hex, where it is used)

| Token | Hex | Used for |
|---|---|---|
| black | `#000000` | Desktop nav "BLACK" variant, footer, home hero, pre-footer CTA band, Contact Us button |
| ink | `#0f0f0f` | Body background. Dark page background (collections, news, past works, Boky bio, past-work detail), Boky half of home, "GREY" nav variant |
| ink-55 | `rgba(15,15,15,.55)` | Back pill on dark pages |
| charcoal | `#1c1a17` | Main text on light pages, big names on light |
| grey-363 | `#363636` | Full-width hairline under page titles on dark list pages |
| stone | `#5c5852` | Home stats grid cells, home Articles section, collection-detail and artwork-detail page background |
| taupe | `#6f6a61` | Muted text on light (subtitles, eyebrows, body notes). Hover bg of "All Articles" bar |
| taupe-2 | `#8a8375`, `#8a8a86`, `#999999` | Captions, quotes, small meta |
| sand | `#b4aea3` | Muted text on dark (Boky subtitles, italic intros) |
| grey-c2 | `#c2c2c2` | Body copy on dark detail pages, copyright, card dates on dark |
| hairline | `#dbdbdb` | 1px rule lines (cards, bios), light text on dark (`Angel Forces` title) |
| paper | `#f5f2eb` | Light page background (blake-bio, galleries, gallery-detail, news-article), Blake half of home, "Light" nav variant, light text on dark |
| paper-2 | `#f4f1ea`, `#f3f1e9`, `#e9e4d9` | "All Collections" bar and coming-soon background (`#f4f1ea`), Blake bio main background (`#f3f1e9`), light panels (`#e9e4d9`) |
| white | `#ffffff` | Contact page background, text on black |
| gold-light | `#e3caa6` | Link hover colour everywhere, footer column labels `[LINKS]`, Blake bar hover background |
| gold | `#cca46c` | Boky bar and Boky CTA hover background, back-pill hover background |
| gold-dark | `#9c7f4e` | "This collection is coming soon" tag |
| hover-grey | `#454545` | Contact Us button hover |
| hover-taupe | `#91897d` | "All Collections" bar hover background |

Translucent fills: `rgba(255,255,255,.02)` (light back pill) and `.04` (light chips). The desktop nav uses `backdrop-filter: blur(10px)` on top of its solid fill.

### Fonts actually rendered (`@font-face` sources)

| Family | Weights and styles rendered | Source |
|---|---|---|
| Cormorant Garamond | 300, 400, 500, 600 normal. 400 italic (also loaded: 300i, 500i, 600i, 700, 700i) | Google Fonts, `fonts.gstatic.com/s/cormorantgaramond/v21/...` (e.g. 400 `co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnbEi_s4Mfs.woff2`, 500 `..._s06GnbEi_s4Mfs.woff2`). Use Google Fonts `Cormorant Garamond:ital,wght@0,300..700;1,300..700` |
| Inter | 300, 400 normal, 300 italic, 400 italic (700 loaded, not seen) | Framer CDN `framerusercontent.com/assets/*.woff2`, split by unicode range. Use Google Fonts Inter 300/400 + italics |
| Switzer | 300 normal, 400 normal (400 italic loaded) | Fontshare via Framer: 300 `framerusercontent.com/third-party-assets/fontshare/wf/EW5HJEX6O4L64XUWQA2XU7Q6BZ3B4JA4/ZWUP4SQYHHMMSS5LFHFFBX6DXL7C3DTU/H5EOHLIZH5K7IZK6SGYJI75L4KV6FUO7.woff2`. Self-host from fontshare.com (free) |
| Fragment Mono | loaded, not seen rendered | Google Fonts |

Framer fallback metrics (use them to avoid layout shift):

- `Cormorant Garamond Placeholder`: local Times New Roman, ascent 96.16%, descent 29.87%, size-adjust 96.09%.
- `Inter Placeholder`: local Arial, ascent 89.79%, descent 22.36%, size-adjust 107.89%.
- `Switzer Placeholder`: local Arial, ascent 96.67%, descent 24.66%, line-gap 8.88%, size-adjust 101.38%.

Font roles:

- **Cormorant Garamond** is the voice: every heading, card title, italic intro and pull quote, the wordmark, and the copyright line.
- **Inter 300** is the body text, nav links and footer links. Inter 400 is used for uppercase tracked labels and buttons.
- **Switzer** is used only for the home stat numbers (90px), the home section bars (22px) and card dates (18px).

### Type scale

Format is size / line-height / tracking. All values are px.

| Role | Font, weight | 1440 | 810 | 390 | Colour |
|---|---|---|---|---|---|
| Display name (home artist names, bio H1, Contact H1) | CG 500 | 104/101.92/+1 | 72/70.56/+1 | 52/50.96/+1 | `#1c1a17` / `#f5f2eb` |
| Coming-soon H1 "In Preparation" | CG 400 | 100/110/-6 | 90/99/-5.4 | 60/66/-3.6 | `#0f0f0f` |
| Stat number (home) | Switzer 400 | 90/normal | 90 | 90 | `#fff` |
| Past Works H1 | CG 500 | 86/87.72 | 60/61.2 | 46/46.92 | `#f5f2eb` |
| Past-work detail H1 | CG 500 | 66/69.3 | 66 | 66 | `#f5f2eb` |
| Section H2 / page title / footer wordmark (most used heading) | CG 500 | 54/59.4/+0.5 | 44/48.4/+0.5 | 34/37.4/+0.5 | context |
| Bio stats number | CG 600 | 52/52/-1.04 | 52 | 42/42/-0.84 | |
| CTA "Get in touch for further inquiries" | CG 500 | 52/59.8/-2.08 | 42/48.3/-1.68 | 32/36.8/-1.28 | |
| Home hero line | CG 400 | 50/55/-3 | 40/44/-2.4 | 37/40.7/-2.22 | `#dbdbdb` |
| Detail title (Angel Forces, Spirit Collection) | CG 500 | 46/52.9/+0.4 | 38/43.7/+0.4 | 32/36.8/+0.4 | `#dbdbdb` |
| Big italic intro or quote | CG 400 italic | 38/51.3/-0.76 | 30/40.5/-0.6 | 24/32.4/-0.48 | |
| H3 (Factsheet, article subheads) | CG 500 | 34/40.8/+0.3 | 30/36/+0.3 | 26/31.2/+0.3 | |
| Coming-soon card title | CG 300 | 34/40.8/-1.36 | 29/34.8/-1.16 | 25/30/-1 | |
| Card title (grids, split per character) | CG 300 | 26/36.4/-1.04 | 21/29.4/-0.84 | 19/26.6/-0.76 | `#fff` dark / `#000` light |
| Footer "Contact →", hero links | CG 500 | 28/33.6/-1.12 | 28 | 28 | `#fff` |
| Subtitle italic (under names) | CG 400 italic | 24/33.6/-0.48 | 21/29.4/-0.42 | 18/25.2/-0.36 | `#6f6a61` / `#b4aea3` |
| Wordmark in nav | CG 600 | 22/30.8/-0.44 | 22 | 22 | `#fff` |
| Timeline year / country list | CG 600 / 400 | 22/28.6/-0.44 | 22 | 22 | |
| Home section bar label ("Blake Ward ↘") | Switzer 300 | 22/22/-0.44 | 18/18/-0.36 | 18 | |
| Card date | Switzer 300 | 18/28.8/-0.72 | 14/22.4/-0.56 | 13/20.8/-0.52 | `#000` / `#fff` / `#c2c2c2` |
| Article body | Inter 300 | 17/29.75/-0.34 | 17 | 16/28/-0.32 | `#1c1a17`, `#c2c2c2` on dark |
| Body / nav link / footer link (default) | Inter 300 | 16/25.6/-0.32 | 16 | 16 | context |
| Bio paragraph (home) | Inter 300 | 15/24 | 15 | 15 | |
| Timeline entry | Inter 300 | 14.5/23.2/-0.29 | same | same | |
| Eyebrow / footer label `[LINKS]` | Inter 300 uppercase | 14/22.4/+3.4 | same | same | `#e3caa6` / `#6f6a61` |
| Button label (Contact Us, Register interest) | Inter 400 uppercase | 12/14.4/+1.92 | same | same | |
| Small label (stat captions) | Inter 300 uppercase | 12/14.4/+1.68 | same | same | |
| Micro label ("His collections") | Inter 400 uppercase | 11/13.2/+2.42 | same | same | |
| Copyright | CG 300 | 13/20.8/-0.26 | 12/19.2/-0.24 | 12 | `#c2c2c2` |

Rule of thumb: the body and label sizes stay the same at every width. Only the Cormorant display sizes step down.

### Spacing rhythm

- **Section padding (vertical).** Content sections use 80px top and bottom (bio, galleries, contact). CTA sections use 110px. List pages start with an "Arrive" header of 150px top + 20px bottom (206px total, gap 35px). Detail pages start at 120px (past-work detail, coming soon), 180px (gallery detail) or 200px (collection detail). Bio heroes use 90px top + 70px bottom (106px top on phone).
- **Section padding (horizontal).** The container side gutter is 32px at desktop and tablet, and 12 to 15px on phone (Arrive header 12px, news grid 15px, article 15px). Card grids on list pages use a 20px gutter at 1440/810 and 0 on phone, where cards go full bleed.
- **Container.** `max-width: 1920px`, centred, so there is effectively no max-width cap below 1920. Article text column is 1120px wide at 1440 (news-article list `ul` 1120).
- **Gaps.** Card grid gaps are 0 horizontal with rows 100px (collections) or 32px (news). Bio collections grid gap is 52px row and 40px column. Galleries "Views Grid" gap is 40px. Gallery Partners grid gap is about 8px. Footer gap is 32px.
- **Radii.** Mostly square. 2px on bio and detail hero images, 12px and 8px/10px on small UI (chips, inputs), 50% on dots and timeline nodes, 999px on pill tags ("This collection is coming soon").
- **Shadows.** Only one: the layered Framer soft shadow on the home hero floating images, `-46px -35px 104px` at its largest layer, alpha 0.02 to 0.07. Everything else is flat.
- **Hairlines.** 1px `#dbdbdb` under card images and around bio blocks. 1px `#363636` full width under page titles on dark list pages.

---

## 2. Global chrome

### Desktop nav (1400px and up)

- **Position and size.** `position: fixed; top: 0`, full width, 64px tall. Inner container has 20px side padding with the wordmark on the left and links on the right.
- **No scroll behaviour.** The nav keeps the same fill at every scroll position: no hide on scroll, no transparency over the hero, no shrink.
- **Three fill variants, chosen per page:**
  - **BLACK `#000`:** home, collection-detail, artwork-detail.
  - **GREY `#0f0f0f`:** collections, news, past-works, past-work-detail, boky-bio.
  - **Light `#f5f2eb` with dark text:** blake-bio, galleries, gallery-detail, contact, news-article, coming-soon.
- **Backdrop.** All three variants use `backdrop-filter: blur(10px)`.
- **Wordmark.** "Blake & Boky", CG 600 22px, at x=24, y=19.
- **Links.** Blake, Boky, Past Works, Collections, Exhibitions & Galleries, News, Contact. Inter 300 16px. Right edge at 1406 (34px from the edge). Link gaps are about 27 to 30px.
- **Hover.** Link colour goes `#fff` to `#e3caa6` (the same on the wordmark).

### Tablet and phone nav (809px and below, and 810 to 1399px)

**Closed state:**

- A floating black box `position: fixed; top: 8px; left: 8px`, 200x60, background `#000`.
- Inner padding is 10px. The wordmark (CG 600 22px white) sits at 18,19.
- A 24px "+" icon sits at x=174, y=26. The whole box is clickable.
- No full-width bar. Page content runs under it.

**Open state:**

- The same box grows downward to 200x469.
- The "+" rotates 45° to become an "×".
- The first row turns into "Home". Below it is a stack of 54px rows, padding 10px: Blake Biography, Boky Biography, Past Works, Collections, Exhibitions & Galleries (wraps to 2 lines, 87px), News, Contact.
- Each row is CG 500 24px/34px, colour `#dbdbdb`, on `#000`.

**Animation:** height 60 to 469 and icon 0 to 45° together, driven by a JS spring with no overshoot:

- about 50% at 150ms, 90% at 400ms, settled at about 1000ms.
- CSS approximation: `transition: height .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)`.
- No WAAPI animation and no backdrop. Screenshot: `screens/menu-open-390.png`.

### Back pill (detail pages)

- **Position.** `position: fixed`, top 88px, left 20px (desktop) or 8px (tablet and phone).
- **Size and layout.** 38px tall, padding 10px 18px 10px 14px, gap 8px.
- **Content.** "←" (Inter 400 15px) + label (Inter 400 12px/14.4, +0.96px tracking). Labels: "Spirit Collection", "Collections", "Back to Boky", "Galleries", "News", "Past Works".
- **Dark variant.** Background `rgba(15,15,15,.55)`, text `#f2f2f2`, arrow `#e3caa6`.
- **Light variant.** Background `rgba(255,255,255,.02)` with a border, text `#0f0f0f`.
- **Hover.** Background goes to `#cca46c`.

### Pre-footer CTA band (collections, news, past works, home)

- **Size.** 638px tall at 1440 (padding 250px 20px), 627px at 810 (250px 40px), 554px at 390 (200px 20px).
- **Background.** Full-bleed photo with `object-fit: cover`. The photo is different on each page: gallery interior on collections, architecture on past works, a lecture on news, the artists on home.
- **Content.** Centred CG 500 52px "Get in touch for further inquiries" + a black "Contact Us →" button. The button has background `#000`, label CG italic 24px, about 149x54. Hover: background `#454545` and width 149 to 154px.
- **Light pages.** Bios, galleries and gallery-detail use a plain paper "Contact CTA" section instead (110px padding) with an outlined CONTACT US button.

### Footer

- **Desktop.** 475px tall, background `#000`, padding 52px 46px, column gap 32px. It is `position: sticky; top: 0` as the last element (Framer's reveal pattern), so the rebuild can use a plain static footer.
- **Desktop columns.** Three link columns at x=58, 284, 511:
  - `[LINKS]`: Blake Biography, Boky Biography, Past Works, Collections, Exhibitions & Galleries, News.
  - `[BLAKE SOCIAL]`: Instagram, Sculpture Network, Wikipedia.
  - `[BOKY SOCIAL]`: Instagram, Sculpture Network.
  - Labels are Inter 300 14px uppercase, +3.4px tracking, `#e3caa6`. Links are Inter 300 16px white with rows about 42px apart.
- **Right side.** "Blake & Boky" CG 500 54px, right aligned, at y+49. "Contact →" CG 500 28px at the bottom right.
- **Bottom row.** A 1px rule, then "Copyright © 2026 Blake&Boky. All rights reserved." in CG 300 13px `#c2c2c2`.
- **Tablet.** Same layout, 679px tall.
- **Phone.** 975px tall, padding 24px 12px 52px. Columns stack, left aligned at x=24. The wordmark drops to 34px.
- **Link hover.** Colour goes to `#e3caa6` and a 1px underline (`Line`) goes from opacity 0 and width 0 to opacity 1 and full width. 200ms `cubic-bezier(.44,0,.56,1)`.

---

## 3. Per template

All numbers are document y and height in px. Format is section: desktop 1440 / tablet 810 / phone 390.

### Home (`/`). Page height 5821 / 7389 / 10341

1. **Hero** (`Hero Main`, black):
   - Height is 100vh: 900 / 1100 / 844. Padding 50px 30px 30px.
   - Centred CG 400 50px line "Blake Ward & Boky Hackel Exploring human essence through figurative sculpture" (`#dbdbdb`), max about 640px wide, centred at y≈375.
   - Seven scattered floating photos, absolutely positioned. Sizes at 1440: 186x194, 221x312, 300x340, 180x198, 221x356, 195x246, 146x146. They partly overflow the edges at phone width.
   - Photos are `grayscale(1)` at rest with the layered soft shadow.
   - **Mouse parallax:** each photo moves away from the cursor, up to about ±55px, with a different depth per image and spring smoothing.
   - **Hover:** `grayscale(0)` + `scale(1.1)`.
2. **About the Artists:**
   - **Desktop:** two halves, 720px each, 1296px tall. Blake half is `#f5f2eb` (bottom padding 100px). Boky half is `#0f0f0f`.
   - **Phone:** halves stack (1170 + 1199).
   - Each half from the top:
     1. A 136px-tall link bar: Switzer 22px name + ↘ arrow + an underline `Line`.
     2. Eyebrow "SCULPTOR · MONACO" (Inter 14px uppercase, +3.4).
     3. Name at 104px.
     4. Italic subtitle at 24px.
     5. Square portrait 380x380 (320 at 810, 326 at 390).
     6. Paragraph Inter 300 15/24, max about 300px, centred.
     7. Hairline.
     8. "HIS COLLECTIONS" micro label + CG 18px list.
     9. Outlined CTA "Read Blake's story →" (CG 400 26px, 300x71).
   - **Bar hover:** Blake bar background goes to `#e3caa6`, Boky bar to `#cca46c`. The arrow rotates from 90° (↘) to 0° (→) and the underline grows (77px to label width).
   - **CTA hover:** background `#e3caa6` (Blake) or `#cca46c` (Boky).
3. **Stats and image grid:**
   - CSS grid of 4x360px at 1440 (two rows of 387px), 2x405 at 810 (435px rows), 1x390 at 390 (419px rows). No gaps.
   - Cells alternate image and stat on `#5c5852` with 50px padding.
   - Image cells hold a 260x287 cover image.
   - Stat cells: Switzer 90px number + Inter caption (exhibitions, Collections, Sculptures made, Countries exhibited in).
   - The numbers count up when in view. The live counter is broken: "Sculptures made" keeps counting past 190 and the others stop at random values (seen: 50/10/90/29, 63/12/103/29, 78/12/190/29). See open question 1.
4. **"All Collections" bar:**
   - Full-width link, 136px tall, background `#f4f1ea`, padding 50px 20px, centred Switzer 22px label + arrow.
   - **Hover:** background `#91897d`, arrow rotates, underline grows.
5. **Fullscreen image:**
   - `figure`, 100vh tall, `position: sticky; top: 0`.
   - The image is 1080px tall inside a 900px frame (120% tall, centred, cover). The next section scrolls up over it like a curtain.
   - Phone: frame 844, image 861.
6. **Articles:**
   - Sticky, background `#5c5852`, bottom padding 50px.
   - "All Articles ↘" bar, 136px (hover background `#6f6a61`).
   - A row of 4 news cards in a 50px-padded flex row, 515px tall. Cards are about 335px wide with a square 335x335 image.
   - Phone: cards stack (1067px).
7. **Pre-footer CTA band** (638px), then the footer.

### Collections index (`/collections`). Page height 3091 / 7179 / 11974. Dark `#0f0f0f`

- **Arrive header.** 206px tall (padding 150px 32px 20px). Title "Collections" CG 500 54px, then the full-width `#363636` hairline.
- **Card grid.** Padding 50px 20px 150px. CSS grid:
  - 1440: 4 x 350px, column gap 0, row gap 100px.
  - 810: 2 x 385px.
  - 390: 1 x 390px full bleed, row gap 60px.
- **Card.** Image, then date (Switzer 300 18px), then title (CG 300 26px, split into characters).
  - 1440: square 350x350 image.
  - 810: tall 385x684 (0.563).
  - 390: 390x693 (0.563).
  - 12 cards.
- **Card hover.** Image `scale(1.1)` inside an `overflow: hidden` frame. The `#dbdbdb` hairline under the image (350x1) shifts slightly.
- Then the pre-footer CTA band and the footer.

### Collection detail (`/collections/spirit-collection`). Page height 7578 / 9115 / 16679. Background `#5c5852`

- Back pill. Wrap padding: 200px 0 110px at 1440, 200px 32px at 810, 200px 0 80px at 390. Gap 106px between blocks.
- **Intro block:**
  - Eyebrow "BLAKE WARD AND BOKY HACKEL-WARD".
  - CG 500 46px title (`#dbdbdb`).
  - Long italic intro, CG 400 italic 38px/51.3 (30px / 24px on smaller widths).
  - Small Inter footnotes.
  - Meta row: a 4-column grid (YEAR, CATEGORY, SIZE, MEDIUM), each 336px wide with column gap 32px and a 1px rule on top. One column at 390.
- **Feature images:**
  - Row of 2 at 1440 (710x620 each, gap 20px), then a row of 3 (467x830, gap 20px).
  - At 390 the row of 3 does not reflow: 150x267 tiles overflow to x=-50. This is a Framer bug, so do not copy it. Stack them instead.
- **"The Works":**
  - Eyebrow + "Spirit Collection" heading + search or filter strip.
  - Grid of 4 artwork cards per row at 1440 (433x770 cards, ratio 0.563, cover) with date and CG title below.
  - 2 per row at 810. 1 per row at 390.
  - Card hover: image `scale(1.1)`.
  - 14 works.

### Artwork detail (`/collections/spirit-collection/angel-forces`). Page height 5330 / 4535 / 4733. Background `#5c5852`

- **Image Ticker** at the top:
  - Full-bleed horizontal strip, 630px tall at 1440, 770px at 810, 591px at 390.
  - Images are `object-fit: contain`, about 420x630, gap 4px. The 8 images are duplicated into 16 for an endless loop.
  - The strip is translated (a Framer Ticker). Cursor is `grab`, so it can be dragged.
  - Image hover: `scale(1)` to `scale(1.04)`, 620ms `cubic-bezier(.22,.61,.36,1)`.
- **Info column:**
  - Centred, about 580px wide, padding 82px 0, gap 60px.
  - Title CG 500 46px + subtitle.
  - Inter 300 17/29.75 body in `#c2c2c2`.
  - "Factsheet" H3 34px + label lines (Dimensions, Edition, Material).
- **Gallery Lightbox grid:**
  - 3 per row at 1440 and 810 (469x834 / 259x461, ratio 0.563, gap 16px). 2 per row at 390 (187x332).
  - The 8 images are buttons labelled "Open image n of 8". A Framer lightbox exists ("Gallery Lightbox") but a forced click did not open an overlay in headless Chromium, so its open animation was not measured.
- **Next work card.** Right aligned, about 420x90, 1px border, thumb 122x150 (`object-position: 50% 0`).
- **"Get in touch / Inquire about this piece" box.** Full width with a 1px border, CG 32px heading and an outlined CONTACT US button.

### Collection coming soon (`/collections/coming-soon-blake`). Page height 4222 / 4744 / 12729. Background `#f4f1ea`, Light nav

- Wrap padding: 120px 32px 0 at 1440, 120px 0 0 at 810 and 390.
- Back pill, eyebrow "BLAKE WARD", then H1 "In Preparation" (CG 400 100px, -6px tracking).
- Gold pill tag "THIS COLLECTION IS COMING SOON". Inter 11px uppercase, +1.98px tracking, `#9c7f4e`, 1px border, radius 999px.
- **Two columns at 1440.** Left: italic CG 32px lead, Inter 16px note, and two buttons (REGISTER INTEREST filled-outline, BROWSE OTHER COLLECTIONS ghost). Right: a 656x620 "Plate" image (cover).
- Hairline, then "IN THE MEANTIME" + "Collections you can see now" (CG 500 32px).
- A 4-column card grid (344x611, ratio 0.563, no gap, 12 cards). 2 columns at 810 (270x480 or 3 across). 1 column at 390 (390x693).

### Past works index (`/past-works`). Page height 4645 / 5658 / 9324. Dark

- Arrive header 206px, back pill "Back to Boky", eyebrow "Boky Hackel-Ward" (Inter 16px), then the hairline.
- H1 "Past Works" CG 500 86px + italic CG 26px intro (`#b4aea3`).
- **Grid.** 3 columns of 459x459 squares at 1440 (wrap padding 0 32px, no gap, row spacing about 190px including captions). 2 x 379 at 810 (side padding 26px). 1 x 390 at 390.
- **Captions.** CG 300 26px, split per character.
- **Hover.** `scale(1.1)`.
- Then the pre-footer CTA band and the footer.

### Past work detail (`/past-works/the-story`). Page height 2124 / 2328 / 2801. Background `#0f0f0f`

- Wrap padding 120px 32px 0, gap 18px. Back pill, eyebrow, H1 CG 500 66px.
- Meta grid of 2 columns (676px each, gap 24px, 34px top padding, top rule): YEAR and MEDIUM, with labels Inter 12px uppercase and values CG 22px.
- **Hero image.** Full container width x 620px, cover, radius 2px.
- **Body.** Inter 300 16px `#c2c2c2`, max about 700px. "View original →" outlined button (Inter 400 16px, 1px border).

### News index (`/news`). Page height 2612 / 3298 / 4453. Dark

- Same shell as Collections: Arrive header, then a grid of 4 x 350px (row gap 32px), 2 x 385px, or 1 x 360px (15px side padding, row gap 60px). Cards always have square images.
- Card: date (Switzer 18px) + title (CG 300 26px, split per character).
- Hover: `scale(1.1)`.

### News article (`/news/sculptures_symbolisiing_hope`). Page height 4705 / 6358 / 7665. Paper `#f5f2eb`, Light nav

- Arrive header (paper) with the title in Inter 300 26px/36.4 (not Cormorant), then the hairline.
- **Lead image.** Centred, 659x468 at 1440. Full width (810x576 and 390x277) on smaller widths.
- **Article.** Padding 100px 20px 75px, column about 700px wide.
  - Date: Inter 20px.
  - Body: Inter 300 17px/29.75, `#1c1a17`. Bold runs at weight 400.
  - Subheads: CG 500 27px/33.75. Some are 34px.
  - Pull quotes: Inter 400 italic 16px/28.8, `#999`, with a left rule.
  - Bulleted list.
- **Links block.** Padding 50px 32px 100px. Previous and next cards, each about 450x95 with a 1px border, label Inter 12px uppercase +1.8px and a 122x150 thumb.

### Galleries (`/galleriespetley`). Page height 6693 / 6777 / 8455. Paper `#f5f2eb`

1. Hero: padding 150px 0 70px. Eyebrow, H1 CG 54px, italic subtitle, gallery logo (420x86).
2. **Gallery Partners.** Grid of 3 x 453x453 squares (gap about 8px) with date and title. 2 x 369 at 810. 1 x 390 at 390.
3. **Introduction.** Centred italic CG 26px paragraph, max about 640px.
4. **Exhibitions.** Three stacked blocks, each with a full-width image 1376 wide (heights about 267 to 450, cover) and below it a 2-column row: year + CG 34px title on the left, Inter 300 small text on the right.
5. **Installation Views.** Grid of 3 x 432px (gap 40px). 2 columns at 810 (gap 8px). 1 column at 390.
6. **Visit.** "By appointment" + mail and phone links.
7. **Contact CTA** (paper).

### Gallery detail (`/galleriespetley/petley-jones`). Page height 2168 / 2329 / 2371. Paper

- Hero padding 180px 0 64px. Eyebrow + centred CG 54px title.
- Image block padding 20px 32px 80px. "Image Fill" is 1312x560 at 1440, 746x560 at 810, 366x300 at 390 (cover, see crop audit).
- Info section (80px padding). Contact CTA (110px padding).

### Blake bio (`/blake-bio`). Page height 9152 / 7274 / 11716. Background `#f3f1e9`, Light nav

Sections and heights (1440 / 810 / 390):

| Section | Padding | 1440 | 810 | 390 |
|---|---|---|---|---|
| Hero | 90px top / 70px bottom (106px top on phone) | 805 | 805 | 696 |
| Artist Statement | 80px | 322 | 322 | 387 |
| Biography | 80px | 1284 | 1284 | 1703 |
| Collections | 80px | | 3333 | 6844 |
| Exhibitions | 80px | | 511 | 745 |
| Contact CTA | 110px | | 341 | 366 |

- **Hero.** Eyebrow "SCULPTOR · MONACO", name 104px, italic subtitle, portrait 430x421 (radius 2px).
- **Artist Statement.** Centred CG italic 38px quote, max about 900px.
- **Biography.** Left: intro in CG italic 26px. Right: vertical timeline with years (CG 600 22px) and Inter 14.5px entries, joined by a 1px line and 50% dots.
- **Collections.**
  - 1440: 2 columns of 668x1188 (ratio 0.563), column gap 40px, row gap 52px, grid starting at x=32.
  - 810: 2 x 365x649.
  - 390: 1 x 390x693.
  - Captions: CG title + Inter uppercase years.
- **Exhibitions.**
  - "Exhibited In" country list: CG 22px with "·" separators, wrapping, max width 820px, gaps 10px and 14px.
  - Stats row: 4 columns of 326px (gap 24px) with CG 600 52px numbers and Inter 12px uppercase captions. 2x2 on phone.

### Boky bio (`/boky-bio`). Page height 10931 / 11074 / 17455. Dark `#0f0f0f`, GREY nav

- Same section order as Blake bio.
- **Portrait.** 380x380 square.
- **Collections.** Square images 668x668 in a 2-column grid. 365px squares at 810. 390px squares at 390.
- **Extra sections:**
  - **Artnet Feature** (110px padding): a 2-column block with a 656x520 image, eyebrow "ARTNET NEWS · FEATURE", CG 46px title, quote and "Read the article →".
  - **Past Works teaser** (padding 80px 32px): 3 x 459 squares, the same as the past works index.

### Contact (`/contact`). Page height 2872 / 2939 / 3259. Background `#ffffff`, Light nav

1. Hero: padding 106px 0 64px. H1 104px + intro.
2. Portrait image 860x684, centred (746x594 at 810, 390x260 at 390).
3. **Details Grid.** 3 columns of 480px (gap 48px) at 1440, 3 x 270px at 810, stacked at 390. Each column has a CG 26px heading (Pietrasanta, Italy / General inquiries) and Inter 18px lines.
4. **Message form.** Wrap padding 0 32px, gap 48px. Fields have 1px bottom borders. SEND MESSAGE button: Inter 400 14px uppercase, +1.92px tracking.

---

## 4. Motion and interaction inventory

- **Smooth scroll.** Lenis is active (`html.lenis`). Use Lenis with default settings: lerp about 0.1, wheel-driven.
- **Page transitions.** Framer uses client-side routing. There is no transition animation, and the new page starts at scrollY 0.
- **Video.** None. No autoplay video anywhere on these templates.
- **Custom cursor.** None. Only `grab` on the artwork ticker.

### Page-load reveal ("Arrive" headers, list and detail pages)

Each animated element gets two keyframe animations at the same time: opacity 0.001 to 1, and `translateY(150px)` to none. They are 1500ms long and come in three variants:

- **Header block.** Delay 1000ms, with a spring easing baked into `linear()` keyframes. A good CSS equivalent is `cubic-bezier(.16,1,.3,1)`.
- **Second header element.** Delay 1200ms, the same spring.
- **Some list elements.** Delay 3000ms, `cubic-bezier(0.59, 0.01, 0.17, 1.53)`. This is an overshoot easing.

### Scroll appear on cards

- Applies to the elements named Square Desktop / Square ipad / Tablet Phone / Default.
- Initial state: `opacity: 0; transform: translateY(30px)`.
- It animates to 1 / 0 when the card enters the viewport, using Framer's spring through rAF, so no WAAPI timing could be read. Use about 0.8s `cubic-bezier(.22,1,.36,1)` with stagger by DOM order.

### Per-character title reveal

- Applies to card titles (CG 300 26px) on collections, news, past works, coming soon, galleries and bios.
- Each title is split into `<span>`s per character.
- Initial state per character: `opacity: .001; transform: translateY(10px)`.
- Animation: to opacity 1 / 0, 2000ms, spring `linear()` easing (the start of the curve is `linear(0 0%, 0.001 0.5%, 0.004 1%, ...)`, roughly `cubic-bezier(.16,1,.3,1)`), stagger 50ms per character (delays 0, 50, 100 seen).
- Triggered on scroll into view.

### Hover states (diffed computed styles)

| Element | Change | Timing |
|---|---|---|
| Nav, footer and text links | colour `#fff` to `#e3caa6`. Footer links also get a 1px underline from opacity 0, width 0 to full | 200ms `cubic-bezier(.44,0,.56,1)` |
| Footer "Contact →" (XL) | text and icon to `#e3caa6` | 200ms |
| Card (grid) | inner image wrapper `scale(1)` to `scale(1.1)`, overflow hidden | spring, about 0.6s |
| Home hero photos | `grayscale(1)` to `grayscale(0)` + `scale(1.1)` | spring |
| Home section bars (Blake, Boky, All Collections, All Articles) | background to `#e3caa6` / `#cca46c` / `#91897d` / `#6f6a61`. Arrow rotates 90° to 0°. Underline grows to the label width (`#dbdbdb` to `#c2c2c2`) | spring |
| Home "Read X's story →" | background to `#e3caa6` (Blake) / `#cca46c` (Boky) | |
| Contact Us button (black) | background `#000` to `#454545`, width +5px | |
| Back pill | background to `#cca46c` | |
| Artwork ticker image | `scale(1.04)` | 620ms `cubic-bezier(.22,.61,.36,1)`. Releases at about 580ms |

### Other motion

- **Mouse parallax.** Home hero photos, described in the Home section above.
- **Sticky curtain stacking on home.** The hero is sticky. The fullscreen figure is `sticky; top: 0`. The Articles section is also `sticky; top: 0`. Each layer slides over the one before it.
- **Count-up.** Home stats. Broken on the live site; see open question 1.
- **Ticker or marquee.** Artwork-detail Image Ticker: a horizontal infinite strip with 4px gap, draggable.
- **Mobile menu spring.** Described in section 2.

---

## 5. Crop audit (images cut by more than 5% under `object-fit: cover`)

"Cut" is the share of the image's width (x) or height (y) that is hidden. The full per-image list is in `docs/reference/crop-audit.json`. The client's complaint is real: most sculpture images are portrait (about 2:3, ratio 0.667) shown in square or even taller frames, with the crop centred. That cuts the plinth and the head or wing tips.

| Page | Element | Width | Frame | Cut | What is lost | Fix |
|---|---|---|---|---|---|---|
| collections | Square Desktop cards | 1440 | 350x350 (1:1) | y 9.6 to 39%, worst 59% (landscape "In Lucem") | Tops and bottoms of standing figures: feet, bases, heads | 4:5 frame + `contain` on `#0f0f0f`, or keep cover with per-image `object-position` (a CMS focal field) |
| collections / coming-soon / blake-bio | Tablet Phone / Collections Wrap / Default cards | 810, 390 (bio all widths) | 0.563 tall | x 7.5 to 77% | Landscape and square works ("Green Fern", In Lucem, Silentium Aurum) lose up to 3/4 of their width | Use the image's own ratio (masonry), or `contain` on the page background for anything wider than 0.75 |
| collection-detail | Works cards | all | 433x770 (0.563) | x 15% | Wing tips and the sides of portrait (0.667) sculptures | 2:3 frame (`aspect-ratio: 2/3`), which removes the crop entirely for this set |
| collection-detail | Wrap feature images | 1440 | 710x620 and 467x830 | y 13 to 35%, x 44% (square "Angel Zuriel" in a tall slot) | Heads and bases | Native ratio, or contain on `#5c5852` |
| collection-detail | Wrap row of 3 | 390 | 150x267, overflowing the viewport | x 44% | Layout bug, tiles off screen | Stack, 1 column, native ratio |
| artwork-detail | Gallery Lightbox | all | 0.563 | x 12.7 to 15.6% | Edges of the sculpture (outstretched elements) | `aspect-ratio: 2/3` (matches the source exactly) |
| artwork-detail | Next-work thumb | all | 122x150 | y 18.5% (`object-position: 50% 0`) | Base | Fine as a thumb, or use 2:3 |
| past-works / boky-bio | Square Desktop or ipad cards | all | 1:1 | y 16 to 31% portrait, x 16 to 44% landscape | Heads and bases of sculptures, sides of studio photos | 4:5 or native ratio, or contain on `#0f0f0f` |
| boky-bio | Collections squares (Desktop / IPhone) | all | 1:1 | y 17 to 59% | Same as above | Native ratio grid |
| boky-bio / home | Portrait of Boky | all | 380x380 | y 25.5% | Top of the head and the chin area | 3:4 frame, or `object-position: 50% 20%` |
| boky-bio | Artnet Feature image | 810, 390 | 341x520 / 390x520 | x 34% / 25% | Sides of the square photo | 1:1 frame |
| coming-soon | Plate | 810, 390 | 357x620 / 390x620 | x 60 to 63% | Most of a wide (1.54) installation shot | Native ratio (about 3:2) when stacked |
| collections / news / past-works / home | Pre-footer CTA background | 810, 390 | 0.70 to 1.29 | x 37 to 70% | Most of the photo on phone; past works loses 70% on desktop (portrait photo in a 2.26 banner) | Fine as atmosphere. Pick landscape photos and set `object-position` per page |
| home | Fullscreen Section (Blake at work) | 810, 390 | 0.61 / 0.48 | x 59% / 68% | Most of the figure and hands | Set `object-position` on the subject (Blake's face and hands, about 60% 40%), or use a shorter frame on phone |
| home | Case images in stats grid | all | 260x287 (0.91) | y 26 to 28% | Tops and bases of portrait sculptures | `contain` on `#5c5852` (fits the cell colour), or a 2:3 cell |
| home | Hero floating photos | all | about 1:1 | 6 to 27% | Minor | Size each frame to its image's ratio |
| galleries | Partner squares | all | 1:1 | 22 to 33% | Sides and top of portrait gallery photos | Native ratio |
| galleries | Exhibition banners | 1440, 390 | 5.15 / 3.25 | y 19 to 20%, x 8 to 22% | Top and bottom strip, or a portrait sculpture in a banner (0.557 source) | Keep for panoramas. Show portrait sources with `contain` |
| gallery-detail | Image Fill | all | 2.34 / 1.33 / 1.22 | y 71.5% / 50% / 45% | A portrait sculpture shown as a wide strip: the head and the base are gone | Native 2:3 frame with max-height 80vh and `contain` on paper |
| past-work-detail | Hero Image (square source) | 1440, 390 | 2.22 / 0.53 | y 55% / x 47% | Half the photo: faces cut | Native 1:1 with a max width, or contain |
| news | Square cards | all | 1:1 | x/y 10 to 29% | Sides of landscape press images | 4:3 frame, or keep |
| contact | Artists photo | 390 | 1.5 | y 16% | Minor | Use 4:3 on phone |
| news-article | Prev/next thumbs | all | 122x150 | x 8 to 9% | Negligible | Keep |

**Recommended system for the rebuild:**

- Artwork and sculpture imagery never uses `cover` in a fixed frame that fights its own ratio.
- Collection, work and gallery grids use `aspect-ratio: 2/3` (the dominant sculpture source ratio, 0.667), with `object-fit: contain` on the section background.
- Each image gets an optional CMS `focalPoint` that feeds `object-position` wherever cover is kept (banners, CTA backgrounds).

---

## 6. Open questions found while measuring

1. **Home stat counters are broken live.** The values never settle and keep counting. The start values seen were 40+, 0, 80+, 20. Ask the client for the real targets. The first page load showed 50+ exhibitions, 10 collections, 90+ sculptures and 29 countries.
2. **Collection-detail at phone width.** The row of 3 overflows off the screen (x=-50). This is a Framer bug, so do not reproduce it.
3. **Gallery Lightbox open and close animation.** It could not be triggered headless. Check it by hand in a real browser before building.
